/**
 * Usage Check API
 * Check if client can perform an action based on their tier limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyId } from '@/lib/auth/whop-auth';
import { supabase } from '@/lib/supabase';
import { checkLimit, getClientUsage } from '@/lib/pricing/usage-tracker';
import { getTier, type TierName } from '@/lib/pricing/tiers';

export async function POST(request: NextRequest) {
  try {
    // Get companyId from Whop auth
    const companyId = await getCompanyId(request);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'addStudent' | 'createForm' | 'generateInsight'

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Get client's tier
    const { data: client } = await supabase
      .from('clients')
      .select('current_tier, subscription_status')
      .eq('company_id', companyId)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const tier = (client.current_tier || 'atom') as TierName;
    const tierData = getTier(tier);

    // Check if subscription is active (for paid tiers)
    if (tier !== 'atom' && client.subscription_status !== 'active') {
      return NextResponse.json({
        allowed: false,
        reason: 'Your subscription is inactive. Please renew to continue using premium features.',
        tier,
        limits: tierData.limits,
      });
    }

    // Check usage limits
    const limitCheck = await checkLimit(companyId, tier, action);
    
    if (!limitCheck.allowed) {
      return NextResponse.json({
        allowed: false,
        reason: limitCheck.reason,
        current: limitCheck.current,
        limit: limitCheck.limit,
        tier,
        upgrade: {
          message: 'Upgrade your plan for higher limits',
          url: '/upgrade',
        },
      });
    }

    // Get current usage stats for display
    const usage = await getClientUsage(companyId);

    return NextResponse.json({
      allowed: true,
      tier,
      limits: tierData.limits,
      usage,
    });

  } catch (error: any) {
    console.error('Error checking usage limits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check usage limits' },
      { status: 500 }
    );
  }
}

/**
 * Get current usage stats
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get client's tier
    const { data: client } = await supabase
      .from('clients')
      .select('current_tier, subscription_status, subscription_expires_at')
      .eq('company_id', companyId)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const tier = (client.current_tier || 'atom') as TierName;
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
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch usage stats' },
      { status: 500 }
    );
  }
}


