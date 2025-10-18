/**
 * Revenue API Endpoint
 * Fetches revenue data for the revenue dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { getCompanyId } from '@/lib/auth/whop-auth';

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
    const { searchParams } = new URL(request.url);
    
    // Check for development bypass
    const bypassAuth = process.env.BYPASS_WHOP_AUTH === 'true';
    
    let companyId: string | null = null;
    
    if (bypassAuth) {
      // Development bypass mode - but still require companyId
      companyId = searchParams.get('companyId');
      if (!companyId) {
        return NextResponse.json(
          { error: 'companyId parameter required in bypass mode' },
          { status: 400, headers: corsHeaders }
        );
      }
      console.log('⚠️ Development bypass mode - using companyId:', companyId);
    } else {
      companyId = await getCompanyId(request);
    }
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400, headers: corsHeaders }
      );
    }

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

    // Fetch revenue events (orders)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('client_id', clientId)
      .eq('event_type', 'order')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (eventsError) {
      console.error('Error fetching revenue events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch revenue data' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Calculate total revenue
    const totalRevenue = (events || []).reduce((sum, event) => {
      return sum + (event.event_data?.amount || 0);
    }, 0);

    return NextResponse.json({
      revenue: events || [],
      total: totalRevenue,
      count: events?.length || 0,
      timestamp: new Date().toISOString(),
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error in revenue API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revenue' },
      { status: 500, headers: corsHeaders }
    );
  }
}

