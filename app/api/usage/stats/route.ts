/**
 * Usage Statistics API
 * Returns current usage vs tier limits for display
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { getTier, type TierName } from '@/lib/pricing/tiers';
import { getClientUsage } from '@/lib/pricing/usage-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

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

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const tierName = (clientData.current_tier || 'starter') as TierName;
    const tierInfo = getTier(tierName);
    
    // Get current usage
    const usage = await getClientUsage(companyId);
    
    // Check if trial is active
    const isOnTrial = clientData.trial_ends_at && new Date(clientData.trial_ends_at) > new Date();

    return NextResponse.json({
      tier: tierName,
      tierInfo: {
        displayName: tierInfo.displayName,
        limits: tierInfo.limits,
      },
      usage,
      isOnTrial,
      trialEndsAt: clientData.trial_ends_at,
      subscriptionStatus: clientData.subscription_status,
    });

  } catch (error) {
    console.error('Usage stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

