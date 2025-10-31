/**
 * Check Trial Eligibility API
 * Determines if a user is eligible for the 7-day free trial
 * Users are only eligible if they've never subscribed before
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    // Check if this company has ever had a subscription
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, whop_plan_id, subscription_status, created_at')
      .eq('company_id', companyId)
      .single();

    if (clientError && clientError.code !== 'PGRST116') {
      // PGRST116 = not found, which is OK
      console.error('Error checking client:', clientError);
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      );
    }

    // If no client record exists, they're eligible for trial
    if (!client) {
      return NextResponse.json({
        eligibleForTrial: true,
        reason: 'new_user',
        hasActiveSubscription: false
      });
    }

    // Check subscription history
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, status, created_at')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('Error checking subscriptions:', subError);
    }

    // User is NOT eligible for trial if:
    // 1. They currently have an active subscription
    // 2. They have ever had a subscription in the past
    const hasActiveSubscription = client.subscription_status === 'active';
    const hasPreviousSubscription = subscriptions && subscriptions.length > 0;

    const eligibleForTrial = !hasActiveSubscription && !hasPreviousSubscription;

    return NextResponse.json({
      eligibleForTrial,
      reason: eligibleForTrial 
        ? 'new_user' 
        : hasActiveSubscription 
          ? 'active_subscription' 
          : 'previous_subscription',
      hasActiveSubscription,
      currentPlan: client.whop_plan_id || null,
      subscriptionStatus: client.subscription_status || 'none'
    });

  } catch (error) {
    console.error('Trial eligibility check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}


