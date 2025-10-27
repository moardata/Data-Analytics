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

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400 }
      );
    }

    // Get client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, current_tier, trial_ends_at, subscription_status')
      .eq('company_id', companyId)
      .maybeSingle();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const tierName = (clientData.current_tier || 'atom') as TierName;
    const tierInfo = getTier(tierName);
    
    // Check if trial is active
    const isOnTrial = clientData.trial_ends_at && new Date(clientData.trial_ends_at) > new Date();
    const isActive = clientData.subscription_status === 'active' || isOnTrial;

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
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}