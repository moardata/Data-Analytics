/**
 * AI Insights Generation API
 * Generates insights from student feedback using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateInsightsForClient, detectAnomalies } from '@/lib/utils/aiInsights';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

// Force Node.js runtime (not Edge) to ensure env vars work properly
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// CORS headers restricted to Whop domain for security
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://whop.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    
    // Log what API key we're seeing
    const currentKey = process.env.OPENAI_API_KEY;
    
    // Debug URL parsing directly
    const url = new URL(request.url);
    
    // Get company ID directly from URL first
    const directCompanyId = url.searchParams.get('companyId');
    
    // Use simple auth (never hangs)
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;
    

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
          limitReached: true,
          details: {
            current: limitCheck.current,
            limit: limitCheck.limit,
            tier: tier,
            feature: 'AI Insights',
            resetPeriod: 'daily'
          },
          upgrade: { 
            message: 'Upgrade to get more AI insights per day',
            url: `/upgrade?companyId=${companyId}`,
            recommendedTier: tier === 'atom' ? 'core' : 'pulse'
          },
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

    // Check OpenAI configuration
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const keyLength = process.env.OPENAI_API_KEY?.length || 0;
    const keyPreview = process.env.OPENAI_API_KEY ? 
      process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not set';
    
    return NextResponse.json({
      success: true,
      insights: [...insights, ...anomalies],
      count: insights.length + anomalies.length,
      timestamp: new Date().toISOString(),
      debug: {
        usedOpenAI: insights.some(i => i.metadata?.ai_generated === true),
        insightSources: insights.map(i => ({
          type: i.insight_type,
          isAIGenerated: i.metadata?.ai_generated === true,
          model: i.metadata?.model || 'unknown'
        })),
        openaiConfig: {
          hasKey: hasOpenAIKey,
          keyLength,
          keyPreview,
          status: hasOpenAIKey ? '✅ CONFIGURED' : '❌ MISSING'
        }
      }
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
    // Use simple auth (never hangs)
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    // Get search params from URL
    const { searchParams } = new URL(request.url);

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
    const timeRange = searchParams.get('timeRange') || 'daily';
    
    // Calculate date range for filtering
    const daysAgo = timeRange === 'daily' ? 1 : timeRange === 'weekly' ? 7 : 7;
    const startDate = new Date(Date.now() - daysAgo * 86400000).toISOString();

    // Fetch existing insights within time range
    const query = supabase
      .from('insights')
      .select('*')
      .eq('client_id', clientId)
      .eq('dismissed', dismissed)
      .gte('created_at', startDate)
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
