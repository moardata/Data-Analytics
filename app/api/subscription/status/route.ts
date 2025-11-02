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
        currentTier: 'scale',
        subscriptionStatus: 'active',
        reason: 'dev_mode'
      });
    }

    // Check client subscription status
    // FIXED: Removed trial_ends_at from SELECT due to PostgREST cache issue
    // We don't need it since we use tier-based access fallback
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

    // Check if subscription is active OR has valid tier
    // FIXED: Removed trial_ends_at dependency (PostgREST cache issue)
    // We rely on tier-based access and subscription_status instead
    const hasValidTier = client.current_tier && client.current_tier !== 'none' && client.current_tier !== null;
    
    const hasAccess = 
      client.subscription_status === 'active' ||
      client.subscription_status === 'trialing' ||
      hasValidTier;  // ✅ FALLBACK: If tier is set, they have access!

    console.log(`🔍 [Subscription Check] Company: ${companyId}, Status: ${client.subscription_status}, Tier: ${client.current_tier}, HasAccess: ${hasAccess}, hasValidTier: ${hasValidTier}`);

    return NextResponse.json({
      hasAccess,
      currentTier: client.current_tier || null,
      subscriptionStatus: client.subscription_status || 'none',
      planId: client.whop_plan_id,
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

