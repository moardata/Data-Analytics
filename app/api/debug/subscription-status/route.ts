/**
 * Subscription Status Diagnostic API
 * Shows actual webhook data, database state, and Whop API state
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { whopSdk } from '@/lib/whop-sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId parameter required' },
        { status: 400 }
      );
    }

    // 1. Check database state
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // 2. Get recent webhooks
    const { data: webhooks } = await supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // 3. Get subscriptions from database
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', client?.id);

    // 4. Try to fetch from Whop API directly
    let whopMemberships = null;
    try {
      // Get all memberships for this company
      const membershipsResult = await whopSdk.client.memberships.list({
        company_id: companyId,
      });
      whopMemberships = membershipsResult.data;
    } catch (whopError: any) {
      console.error('Error fetching from Whop API:', whopError);
      whopMemberships = { error: whopError.message };
    }

    return NextResponse.json({
      success: true,
      diagnosis: {
        companyId,
        database: {
          client: client || { error: clientError?.message || 'Client not found' },
          subscriptions: subscriptions || [],
        },
        webhooks: {
          recent: webhooks || [],
          count: webhooks?.length || 0,
        },
        whopAPI: {
          memberships: whopMemberships,
        },
        analysis: {
          hasClient: !!client,
          currentTier: client?.current_tier || 'none',
          subscriptionStatus: client?.subscription_status || 'none',
          whopPlanId: client?.whop_plan_id || 'none',
          webhooksReceived: webhooks?.length || 0,
          issue: !client ? 'Client not found in database' :
                 !client.current_tier || client.current_tier === 'starter' ? 'No paid tier detected' :
                 'Client exists with tier: ' + client.current_tier
        }
      }
    });

  } catch (error: any) {
    console.error('Diagnostic error:', error);
    return NextResponse.json(
      { error: error.message || 'Diagnostic failed' },
      { status: 500 }
    );
  }
}

