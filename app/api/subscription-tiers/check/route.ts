/**
 * Subscription Tiers Check API
 * Checks current subscription tier and limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { simpleAuth } from '@/lib/auth/simple-auth';
import { getTier } from '@/lib/pricing/tiers';
import { getClientUsage } from '@/lib/pricing/usage-tracker';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    // Get client info
    const { data: client, error } = await supabase
      .from('clients')
      .select('current_tier, subscription_status, subscription_expires_at')
      .eq('company_id', companyId)
      .single();

    if (error || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const tier = (client.current_tier || 'atom') as any;
    const tierData = getTier(tier);
    const usage = await getClientUsage(companyId);

    return NextResponse.json({
      tier,
      limits: tierData.limits,
      usage,
      subscription: {
        status: client.subscription_status,
        expiresAt: client.subscription_expires_at,
      },
    });

  } catch (error: any) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check subscription' },
      { status: 500 }
    );
  }
}


