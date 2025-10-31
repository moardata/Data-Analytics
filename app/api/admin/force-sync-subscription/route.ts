/**
 * Force Subscription Sync API
 * Manually fetches membership data from Whop and updates the database
 * Use this to fix subscription recognition issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { whopSdk } from '@/lib/whop-sdk';
import { getBundleInfo } from '@/lib/pricing/bundles';

export async function POST(request: NextRequest) {
  try {
    const { companyId, userId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Force syncing subscription for company: ${companyId}`);

    // 1. Fetch active memberships from Whop
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
      console.log(`📦 Found ${activeMemberships.length} active memberships from Whop`);
    } catch (whopError: any) {
      console.error('❌ Error fetching from Whop:', whopError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch from Whop API', 
          details: whopError.message 
        },
        { status: 500 }
      );
    }

    // 2. Find the highest tier membership
    let highestTier: 'free' | 'pro' | 'premium' = 'free';
    let highestBundle = 'atom';
    let planId: string | null = null;
    let subscriptionStatus = 'none';

    if (activeMemberships.length > 0) {
      // Sort by tier priority (premium > pro > free)
      const tierPriority = { premium: 3, pro: 2, free: 1 };
      
      for (const membership of activeMemberships) {
        const membershipPlanId = membership.plan_id;
        if (membershipPlanId) {
          const bundleInfo = getBundleInfo(membershipPlanId);
          const currentTierPriority = tierPriority[bundleInfo.tier] || 0;
          const highestTierPriority = tierPriority[highestTier] || 0;
          
          if (currentTierPriority > highestTierPriority) {
            highestTier = bundleInfo.tier;
            highestBundle = bundleInfo.bundle;
            planId = membershipPlanId;
            subscriptionStatus = membership.status || 'active';
          }
        }
      }

      console.log(`✅ Highest tier found: ${highestTier} (${highestBundle}), plan: ${planId}`);
    } else {
      console.log(`⚠️  No active memberships found`);
    }

    // 3. Update or create client record
    const { data: existing } = await supabase
      .from('clients')
      .select('id, trial_ends_at')
      .eq('company_id', companyId)
      .maybeSingle();

    if (existing) {
      // DON'T overwrite if they have an active trial UNLESS we found a better subscription
      const hasActiveTrial = existing.trial_ends_at && new Date(existing.trial_ends_at) > new Date();
      const foundBetterSubscription = activeMemberships.length > 0;
      
      if (hasActiveTrial && !foundBetterSubscription) {
        console.log(`⏭️ [Force Sync] Skipping - user has active trial until ${existing.trial_ends_at}`);
        return NextResponse.json({
          success: true,
          message: 'User has active trial',
          data: {
            companyId,
            tier: existing.current_tier || 'atom',
            reason: 'active_trial',
            trialEndsAt: existing.trial_ends_at,
          }
        });
      }
      
      // Update existing client
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          current_tier: highestTier === 'free' ? null : highestTier,
          whop_plan_id: planId,
          subscription_status: subscriptionStatus === 'none' ? null : subscriptionStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('❌ Error updating client:', updateError);
        return NextResponse.json(
          { error: 'Failed to update client', details: updateError.message },
          { status: 500 }
        );
      }

      console.log(`✅ Updated client ${companyId} to tier: ${highestTier}`);
    } else {
      // Create new client
      const { error: createError } = await supabase
        .from('clients')
        .insert({
          whop_user_id: companyId,
          company_id: companyId,
          email: `company_${companyId}@whop.com`,
          name: `Company ${companyId}`,
          current_tier: highestTier === 'free' ? null : highestTier,
          whop_plan_id: planId,
          subscription_status: subscriptionStatus === 'none' ? null : subscriptionStatus,
        });

      if (createError) {
        console.error('❌ Error creating client:', createError);
        return NextResponse.json(
          { error: 'Failed to create client', details: createError.message },
          { status: 500 }
        );
      }

      console.log(`✅ Created client ${companyId} with tier: ${highestTier}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      data: {
        companyId,
        tier: highestTier,
        bundle: highestBundle,
        planId,
        subscriptionStatus,
        activeMembershipsCount: activeMemberships.length,
      }
    });

  } catch (error: any) {
    console.error('❌ Force sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

