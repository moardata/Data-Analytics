/**
 * Subscription Status API
 * Returns whether user has an active subscription and can access the app
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Dev bypass - allow these company IDs to access everything
// Development-only bypass removed for production security

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Dev bypass - only in development mode
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_BYPASS === 'true') {
      return NextResponse.json({
        hasAccess: true,
        currentTier: 'surge',
        subscriptionStatus: 'active',
        reason: 'dev_mode'
      });
    }

    // Check client subscription status
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, current_tier, subscription_status, whop_plan_id, trial_ends_at')
      .eq('company_id', companyId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking client:', error);
      return NextResponse.json(
        { error: 'Failed to check subscription' },
        { status: 500 }
      );
    }

    // No client record = no subscription = no access
    if (!client) {
      return NextResponse.json({
        hasAccess: false,
        currentTier: null,
        subscriptionStatus: 'none',
        reason: 'no_subscription'
      });
    }

    // Check if subscription is active OR in trial period
    // Users MUST have an active subscription (paid or trial) to access the app
    const hasActiveTrial = client.trial_ends_at && new Date(client.trial_ends_at) > new Date();
    const hasAccess = 
      client.subscription_status === 'active' || 
      client.subscription_status === 'trialing' ||
      hasActiveTrial;  // ✅ ALSO check trial_ends_at date!

    console.log(`🔍 [Subscription Check] Company: ${companyId}, Status: ${client.subscription_status}, Trial: ${client.trial_ends_at}, HasAccess: ${hasAccess}`);

    return NextResponse.json({
      hasAccess,
      currentTier: client.current_tier || null,
      subscriptionStatus: client.subscription_status || (hasActiveTrial ? 'trial' : 'none'),
      planId: client.whop_plan_id,
      trialEndsAt: client.trial_ends_at,
      reason: hasAccess ? 'active_subscription' : 'no_active_subscription'
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

