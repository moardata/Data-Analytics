/**
 * Revenue API Endpoint
 * Fetches revenue data for the revenue dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

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

    // Fetch revenue events (payment.succeeded events contain revenue data)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('client_id', clientId)
      .in('event_type', ['payment.succeeded', 'order', 'payment_intent.succeeded'])
      .order('created_at', { ascending: false })
      .limit(1000);

    if (eventsError) {
      console.error('Error fetching revenue events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch revenue data' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Calculate total revenue and format events
    let totalRevenue = 0;
    const formattedEvents = (events || []).map(event => {
      // Extract amount from various possible locations
      const amount = event.event_data?.amount || 
                     event.event_data?.total || 
                     event.event_data?.value ||
                     event.metadata?.amount ||
                     0;
      
      totalRevenue += amount;
      
      return {
        ...event,
        amount,
        date: event.created_at,
        type: event.event_type
      };
    });

    console.log(`💰 [Revenue API] Found ${formattedEvents.length} revenue events, total: $${totalRevenue}`);

    return NextResponse.json({
      revenue: formattedEvents,
      total: totalRevenue,
      count: formattedEvents.length,
      timestamp: new Date().toISOString(),
      debug: {
        clientId,
        companyId,
        eventTypes: [...new Set(formattedEvents.map(e => e.event_type))],
        hasData: formattedEvents.length > 0
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

