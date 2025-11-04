/**
 * Subscription Refresh API
 * Allows users to manually refresh their subscription status
 * Called when: User just purchased, clicked refresh button, or hit paywall after purchase
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { whopSdk } from '@/lib/whop-sdk';
import { getBundleInfo } from '@/lib/pricing/bundles';

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId required' },
        { status: 400 }
      );
    }

    console.log(`🔄 [Refresh] Manually refreshing subscription for: ${companyId}`);

    // Get user token to also check their personal memberships
    const userToken = request.headers.get('x-whop-user-token');
    let userId: string | null = null;
    
    if (userToken) {
      try {
        const decoded = await whopSdk.verifyUserToken(userToken);
        userId = decoded.userId;
        console.log(`👤 [Refresh] Authenticated user: ${userId}`);
      } catch (e) {
        console.warn(`⚠️ [Refresh] Could not decode user token`);
      }
    }

    // Fetch active memberships from Whop (check both company AND user)
    let activeMemberships: any[] = [];
    try {
      // Check company memberships
      const membershipsResult = await whopSdk.client.memberships.list({
        company_id: companyId,
      });
      let allMemberships = membershipsResult.data || [];
      
      console.log(`📊 [Refresh] Company ${companyId}: ${allMemberships.length} memberships`);
      
      // ALSO check user's personal memberships (if they bought personally)
      if (userId) {
        try {
          const userMembershipsResult = await whopSdk.client.memberships.list({
            user_id: userId,
          });
          const userMemberships = userMembershipsResult.data || [];
          console.log(`👤 [Refresh] User ${userId}: ${userMemberships.length} personal memberships`);
          
          // Combine both
          allMemberships = [...allMemberships, ...userMemberships];
          console.log(`📦 [Refresh] Total combined: ${allMemberships.length} memberships`);
        } catch (userErr) {
          console.warn(`⚠️ [Refresh] Could not fetch user memberships:`, userErr);
        }
      }
      
      console.log(`📊 [Refresh] Whop API returned ${allMemberships.length} total memberships`);
      if (allMemberships.length > 0) {
        console.log(`📦 [Refresh] First membership:`, JSON.stringify(allMemberships[0], null, 2));
      }
      
      // Filter for valid memberships (active OR trialing)
      // Trial users should also get access!
      activeMemberships = allMemberships.filter((m: any) => 
        m.status === 'active' || 
        m.status === 'trialing' || 
        m.status === 'trial' ||
        m.valid === true
      );
      console.log(`✅ [Refresh] Found ${activeMemberships.length} valid memberships (filtered from ${allMemberships.length} total)`);
      
      if (activeMemberships.length > 0) {
        console.log(`📦 [Refresh] Active membership plan_id:`, activeMemberships[0]?.plan_id);
        console.log(`📦 [Refresh] Active membership status:`, activeMemberships[0]?.status);
      }
    } catch (whopError: any) {
      console.error('❌ [Refresh] Whop API error:', whopError);
      console.error('❌ [Refresh] Error details:', JSON.stringify(whopError, null, 2));
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch subscription from Whop', 
          details: whopError.message 
        },
        { status: 500 }
      );
    }

    // Determine highest tier
    let highestTier: 'starter' | 'growth' | 'pro' | 'scale' | null = null;
    let highestBundle = 'none';
    let planId: string | null = null;
    let subscriptionStatus = 'none';

    if (activeMemberships.length > 0) {
      const tierPriority = { scale: 4, pro: 3, growth: 2, starter: 1 };
      
      for (const membership of activeMemberships) {
        // FIXED: Plan ID is nested under membership.plan.id, not membership.plan_id
        const membershipPlanId = membership.plan?.id || membership.plan_id;
        
        console.log(`🔍 [Refresh] Processing membership:`, {
          id: membership.id,
          status: membership.status,
          plan_id: membershipPlanId,
          plan_object: membership.plan
        });
        
        if (membershipPlanId) {
          const bundleInfo = getBundleInfo(membershipPlanId);
          console.log(`📊 [Refresh] Plan ${membershipPlanId} → tier: ${bundleInfo.tier}, bundle: ${bundleInfo.bundle}`);
          
          const currentPriority = tierPriority[bundleInfo.tier] || 0;
          const highestPriority = highestTier ? tierPriority[highestTier] : 0;
          
            if (currentPriority > highestPriority) {
              highestTier = bundleInfo.tier;
              highestBundle = bundleInfo.bundle;
              planId = membershipPlanId;
              // FIXED: Map Whop statuses to our statuses
              // 'completed' means they paid and it's active
              const whopStatus = membership.status || 'active';
              subscriptionStatus = 
                whopStatus === 'active' || whopStatus === 'completed' ? 'active' :
                whopStatus === 'trialing' || whopStatus === 'trial' ? 'trialing' :
                'active'; // Default to active if we found a valid plan
            }
        }
      }
    }

    // Update database
    const { data: existing } = await supabase
      .from('clients')
      .select('id, current_tier')
      .eq('company_id', companyId)
      .maybeSingle();

    const oldTier = existing?.current_tier || 'none';
    const newTier = highestTier || null;
    
    console.log(`📊 [Refresh] Tier determination:`, {
      oldTier,
      newTier,
      highestTier,
      planId,
      activeMembershipsCount: activeMemberships.length,
      subscriptionStatus
    });

    if (existing) {
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          current_tier: newTier,
          whop_plan_id: planId,
          subscription_status: subscriptionStatus === 'none' ? null : subscriptionStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('❌ [Refresh] Update error:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update subscription' },
          { status: 500 }
        );
      }
    } else {
      // Create if doesn't exist
      const { error: createError } = await supabase
        .from('clients')
        .insert({
          whop_user_id: companyId,
          company_id: companyId,
          email: `company_${companyId}@whop.com`,
          name: `Company ${companyId}`,
          current_tier: newTier,
          whop_plan_id: planId,
          subscription_status: subscriptionStatus === 'none' ? null : subscriptionStatus,
        });

      if (createError) {
        console.error('❌ [Refresh] Create error:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create client' },
          { status: 500 }
        );
      }
    }

    const upgraded = newTier && (!oldTier || oldTier === 'none');
    
    console.log(`✅ [Refresh] ${upgraded ? 'Upgraded' : 'Updated'}: ${oldTier} → ${newTier}`);

    return NextResponse.json({
      success: true,
      upgraded,
      previousTier: oldTier,
      currentTier: newTier || 'none',
      bundle: highestBundle,
      planId,
      status: subscriptionStatus,
      message: upgraded 
        ? '🎉 Subscription activated! You now have access to all features.' 
        : newTier 
          ? 'Subscription refreshed successfully.'
          : 'No active subscription found. Please subscribe to access the app.',
    });

  } catch (error: any) {
    console.error('❌ [Refresh] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Refresh failed' },
      { status: 500 }
    );
  }
}

