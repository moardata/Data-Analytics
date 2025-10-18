/**
 * AI Insights Generation API
 * Generates insights from student feedback using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateInsightsForClient, detectAnomalies } from '@/lib/utils/aiInsights';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { getCompanyId } from '@/lib/auth/whop-auth';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check for development bypass
    const bypassAuth = true; // TEMP: Hardcoded for testing
    
    let companyId: string | null = null;
    
    if (bypassAuth) {
      // Development bypass mode
      companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || null;
      console.log('⚠️ Development bypass mode - using companyId:', companyId);
    } else {
      // Production: Get companyId from Whop auth
      companyId = await getCompanyId(request);
    }
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid Whop authentication' },
        { status: 401, headers: corsHeaders }
      );
    }

    // First, get the client record for this company
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, current_tier')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404, headers: corsHeaders }
      );
    }

    const clientId = clientData.id; // This is the actual UUID
    const tier = (clientData.current_tier || 'atom') as any;

    // Check usage limits before generating insights
    const { checkLimit, trackAction } = await import('@/lib/pricing/usage-tracker');
    
    const limitCheck = await checkLimit(companyId, tier, 'generateInsight');

    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason,
          current: limitCheck.current,
          limit: limitCheck.limit,
          upgrade: { message: 'Upgrade for more AI insights', url: '/upgrade' },
        },
        { status: 429, headers: corsHeaders } // Too Many Requests
      );
    }

    const body = await request.json();
    const { timeRange = 'week', includeAnomalies = true } = body;

    // Generate insights
    const insights = await generateInsightsForClient(clientId, timeRange);

    // Track usage
    await trackAction(companyId, 'generateInsight');

    // Optionally detect anomalies
    let anomalies: any[] = [];
    if (includeAnomalies) {
      anomalies = await detectAnomalies(clientId);
    }

    return NextResponse.json({
      success: true,
      insights: [...insights, ...anomalies],
      count: insights.length + anomalies.length,
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check for development bypass
    const bypassAuth = true; // TEMP: Hardcoded for testing
    
    let companyId: string | null = null;
    
    if (bypassAuth) {
      // Development bypass mode
      companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || null;
      console.log('⚠️ Development bypass mode - using companyId:', companyId);
    } else {
      // Production: Get companyId from Whop auth
      companyId = await getCompanyId(request);
    }
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid Whop authentication' },
        { status: 401, headers: corsHeaders }
      );
    }

    // First, get the client record for this company
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404, headers: corsHeaders }
      );
    }

    const clientId = clientData.id; // This is the actual UUID

    const limit = parseInt(searchParams.get('limit') || '10');
    const dismissed = searchParams.get('dismissed') === 'true';

    // Fetch existing insights
    const query = supabase
      .from('insights')
      .select('*')
      .eq('client_id', clientId)
      .eq('dismissed', dismissed)
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: insights, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      insights: insights || [],
      count: insights?.length || 0
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch insights' },
      { status: 500, headers: corsHeaders }
    );
  }
}
