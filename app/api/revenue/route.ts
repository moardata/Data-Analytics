/**
 * Revenue API Endpoint
 * Fetches revenue data for the revenue dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

// Plan pricing lookup (for mock data and fallbacks)
const PLAN_PRICING: Record<string, number> = {
  'plan_1': 10,
  'plan_2': 15,
  'plan_3': 20,
  'plan_gDIQ1ypIFaZoQ': 0,  // Atom (Free)
  'plan_hnYnLn6egXRis': 20, // Core
  'plan_OvGPVPXu6sarv': 100, // Pulse
  'plan_YWwjHKXiWT6vq': 200, // Surge
  'plan_BcSpDXIeGcklw': 400, // Quantum
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    // Use simple auth (never hangs)
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    // Get client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      console.log('No client found for company:', companyId);
      return NextResponse.json(
        { revenue: [], total: 0, count: 0 },
        { status: 200, headers: corsHeaders }
      );
    }

    const clientId = clientData.id;

    // Fetch revenue from multiple sources
    // 1. Get payment/order events AND subscription events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('client_id', clientId)
      .in('event_type', ['payment.succeeded', 'order', 'payment_intent.succeeded', 'payment_succeeded', 'subscription'])
      .order('created_at', { ascending: false })
      .limit(1000);

    // 2. Get all subscriptions (they contain revenue amounts)
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    console.log(`💰 [Revenue API] Data fetched:`, {
      events: events?.length || 0,
      subscriptions: subscriptions?.length || 0,
      eventsError: eventsError?.message,
      subsError: subsError?.message
    });

    if (eventsError) {
      console.error('Error fetching revenue events:', eventsError);
    }

    // Calculate total revenue from both sources
    let totalRevenue = 0;
    const revenueItems: any[] = [];

    // Process payment events
    (events || []).forEach(event => {
      // Try multiple fields to extract amount
      let amount = event.event_data?.amount || 
                   event.event_data?.total || 
                   event.event_data?.value ||
                   event.event_data?.final_amount ||
                   event.event_data?.price ||
                   event.metadata?.amount ||
                   0;
      
      // For subscription events, check for renewal_price or initial_price
      if (event.event_type === 'subscription') {
        amount = amount || 
                 event.event_data?.renewal_price ||
                 event.event_data?.initial_price ||
                 event.event_data?.plan_price ||
                 0;
        
        // If still no amount, look up plan pricing
        if (amount === 0 && event.event_data?.plan_id) {
          const planPrice = PLAN_PRICING[event.event_data.plan_id];
          if (planPrice !== undefined) {
            amount = planPrice;
            console.log(`💰 [Revenue API] Using plan pricing for ${event.event_data.plan_id}: $${planPrice}`);
          }
        }
      }
      
      // Convert cents to dollars if amount looks like cents (> 100)
      if (amount > 100) {
        amount = amount / 100;
      }
      
      if (amount > 0) {
        totalRevenue += amount;
        revenueItems.push({
          id: event.id,
          source: 'event',
          type: event.event_type,
          amount,
          date: event.created_at,
          description: event.event_type === 'subscription' 
            ? `Subscription - ${event.event_data?.plan_name || event.event_data?.plan_id || 'Plan'}`
            : `${event.event_type} event`,
          metadata: event.event_data
        });
      }
    });

    // Process subscriptions
    (subscriptions || []).forEach(sub => {
      const amount = sub.amount || 0;
      
      if (amount > 0) {
        totalRevenue += amount;
        revenueItems.push({
          id: sub.id,
          source: 'subscription',
          type: sub.status,
          amount,
          date: sub.started_at || sub.created_at,
          description: `${sub.status} subscription - ${sub.plan_id || 'Plan'}`,
          metadata: {
            plan_id: sub.plan_id,
            status: sub.status,
            expires_at: sub.expires_at
          }
        });
      }
    });

    // Sort by date descending
    revenueItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`💰 [Revenue API] Total revenue: $${totalRevenue} from ${revenueItems.length} items`);
    console.log(`💰 [Revenue API] Breakdown: ${events?.length || 0} events + ${subscriptions?.length || 0} subscriptions`);

    return NextResponse.json({
      revenue: revenueItems,
      total: totalRevenue,
      count: revenueItems.length,
      timestamp: new Date().toISOString(),
      debug: {
        clientId,
        companyId,
        eventCount: events?.length || 0,
        subscriptionCount: subscriptions?.length || 0,
        totalItems: revenueItems.length,
        hasData: revenueItems.length > 0
      }
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error in revenue API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revenue' },
      { status: 500, headers: corsHeaders }
    );
  }
}

