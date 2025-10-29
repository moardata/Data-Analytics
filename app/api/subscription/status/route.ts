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
const DEV_COMPANY_IDS = ['biz_3GYHNPbGkZCEky'];

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

    // Dev bypass
    if (DEV_COMPANY_IDS.includes(companyId)) {
      return NextResponse.json({
        hasAccess: true,
        currentTier: 'surge', // Max tier for dev
        subscriptionStatus: 'active',
        reason: 'dev_bypass'
      });
    }

    // Check client subscription status
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, current_tier, subscription_status, whop_plan_id')
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

    // Check if subscription is active
    const hasAccess = client.subscription_status === 'active';

    return NextResponse.json({
      hasAccess,
      currentTier: client.current_tier || 'atom',
      subscriptionStatus: client.subscription_status || 'none',
      planId: client.whop_plan_id,
      reason: hasAccess ? 'active_subscription' : 'inactive_subscription'
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

