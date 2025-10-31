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

    // Fetch active memberships from Whop
    let activeMemberships: any[] = [];
    try {
      const membershipsResult = await whopSdk.client.memberships.list({
        company_id: companyId,
      });
      const allMemberships = membershipsResult.data || [];
      // Filter for active memberships only
      activeMemberships = allMemberships.filter((m: any) => 
        m.status === 'active' || m.valid === true
      );
      console.log(`📦 [Refresh] Found ${activeMemberships.length} active memberships`);
    } catch (whopError: any) {
      console.error('❌ [Refresh] Whop API error:', whopError);
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
    let highestTier: 'free' | 'pro' | 'premium' | null = null;
    let highestBundle = 'none';
    let planId: string | null = null;
    let subscriptionStatus = 'none';

    if (activeMemberships.length > 0) {
      const tierPriority = { premium: 3, pro: 2, free: 1 };
      
      for (const membership of activeMemberships) {
        const membershipPlanId = membership.plan_id;
        if (membershipPlanId) {
          const bundleInfo = getBundleInfo(membershipPlanId);
          const currentPriority = tierPriority[bundleInfo.tier] || 0;
          const highestPriority = highestTier ? tierPriority[highestTier] : 0;
          
          if (currentPriority > highestPriority) {
            highestTier = bundleInfo.tier;
            highestBundle = bundleInfo.bundle;
            planId = membershipPlanId;
            subscriptionStatus = membership.status || 'active';
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

