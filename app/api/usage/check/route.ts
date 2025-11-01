/**
 * Usage Check API
 * Check if client can perform an action based on their tier limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { getTier, canPerformAction, canAccessMetric, type TierName } from '@/lib/pricing/tiers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || searchParams.get('clientId');
    const action = searchParams.get('action'); // e.g., 'csvExport', 'pdfExport'
    const metric = searchParams.get('metric'); // e.g., 'consistency', 'popular'

    console.log('🔍 [Usage Check] companyId:', companyId);

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400 }
      );
    }

    // Check if supabase is configured
    if (!supabase) {
      console.error('❌ Supabase server client not configured');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    console.log('📡 [Usage Check] Querying database for client...');

    // Get client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, current_tier, trial_ends_at, subscription_status')
      .eq('company_id', companyId)
      .maybeSingle();
    
    console.log('📊 [Usage Check] Database response:', { clientData, clientError });

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!clientData) {
      // No client record = no subscription
      return NextResponse.json({
        tier: null,
        hasAccess: false,
        subscriptionStatus: 'none',
        message: 'No subscription found'
      });
    }

    // Check if subscription is active or in trial
    const isOnTrial = clientData.trial_ends_at && new Date(clientData.trial_ends_at) > new Date();
    const isActive = clientData.subscription_status === 'active' || clientData.subscription_status === 'trialing' || isOnTrial;

    // If no active subscription, return no access
    if (!isActive || !clientData.current_tier) {
      return NextResponse.json({
        tier: null,
        hasAccess: false,
        subscriptionStatus: clientData.subscription_status || 'none',
        message: 'No active subscription'
      });
    }

    const tierName = clientData.current_tier as TierName;
    const tierInfo = getTier(tierName);

    // Build response
    const response: any = {
      tier: tierName,
      tierInfo: {
        displayName: tierInfo.displayName,
        limits: tierInfo.limits,
        features: tierInfo.features,
      },
      isOnTrial,
      trialEndsAt: clientData.trial_ends_at,
      isActive,
    };

    // If specific action requested, check if allowed
    if (action) {
      const actionKey = action as any;
      response.canPerform = canPerformAction(tierName, actionKey);
      response.action = action;
    }

    // If specific metric requested, check if accessible
    if (metric) {
      response.canAccess = canAccessMetric(tierName, metric);
      response.metric = metric;
    }

    // Return comprehensive tier and permissions info
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [Usage Check] Unexpected error:', error);
    console.error('❌ [Usage Check] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}