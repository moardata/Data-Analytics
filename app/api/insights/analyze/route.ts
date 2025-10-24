/**
 * Enhanced AI Analysis API
 * Performs structured analysis focusing on drop-offs, sentiment, engagement, and pacing
 */

import { NextRequest, NextResponse } from 'next/server';
import { processDataWithAI } from '@/lib/utils/aiProcessing';
import { simpleAuth } from '@/lib/auth/simple-auth';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { timeRange = 'week', forceRefresh = false } = body;

    console.log(`🤖 [AI Analysis] Starting analysis for company ${companyId} (${timeRange})`);

    // Convert companyId to clientId UUID
    const { data: clientData, error: clientError } = await supabaseServer
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id;
    console.log(`🤖 [AI Analysis] Found client UUID: ${clientId}`);

    // Perform enhanced AI analysis
    const analysisResult = await processDataWithAI(clientId, timeRange);

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString(),
      companyId,
      timeRange
    });

  } catch (error: any) {
    console.error('❌ [AI Analysis] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to perform AI analysis',
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID not found' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || 'week';

    console.log(`🤖 [AI Analysis] Getting analysis for company ${companyId} (${timeRange})`);

    // Convert companyId to clientId UUID
    const { data: clientData, error: clientError } = await supabaseServer
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id;
    console.log(`🤖 [AI Analysis] Found client UUID: ${clientId}`);

    // Perform enhanced AI analysis
    const analysisResult = await processDataWithAI(clientId, timeRange);

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString(),
      companyId,
      timeRange
    });

  } catch (error: any) {
    console.error('❌ [AI Analysis] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to perform AI analysis',
        details: error.stack 
      },
      { status: 500 }
    );
  }
}
