/**
 * AI Insights Generation API
 * Generates insights from student feedback using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateInsightsForClient, detectAnomalies } from '@/lib/utils/aiInsights';
import { supabase } from '@/lib/supabase';
import { getCompanyId } from '@/lib/auth/whop-auth';

export async function POST(request: NextRequest) {
  try {
    // Get companyId from Whop auth (with dev fallback)
    const clientId = await getCompanyId(request);
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid Whop authentication' },
        { status: 401 }
      );
    }

    // Check usage limits before generating insights
    const { checkLimit, trackAction } = await import('@/lib/pricing/usage-tracker');
    
    const { data: client } = await supabase
      .from('clients')
      .select('current_tier')
      .eq('company_id', clientId)
      .single();

    const tier = (client?.current_tier || 'atom') as any;
    const limitCheck = await checkLimit(clientId, tier, 'generateInsight');

    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason,
          current: limitCheck.current,
          limit: limitCheck.limit,
          upgrade: { message: 'Upgrade for more AI insights', url: '/upgrade' },
        },
        { status: 429 } // Too Many Requests
      );
    }

    const body = await request.json();
    const { timeRange = 'week', includeAnomalies = true } = body;

    // Generate insights
    const insights = await generateInsightsForClient(clientId, timeRange);

    // Track usage
    await trackAction(clientId, 'generateInsight');

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
    });

  } catch (error: any) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get companyId from Whop auth (with dev fallback)
    const clientId = await getCompanyId(request);
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid Whop authentication' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
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
    });

  } catch (error: any) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
