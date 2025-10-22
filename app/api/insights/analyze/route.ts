/**
 * Enhanced AI Analysis API
 * Performs structured analysis focusing on drop-offs, sentiment, engagement, and pacing
 */

import { NextRequest, NextResponse } from 'next/server';
import { processDataWithAI } from '@/lib/utils/aiProcessing';
import { simpleAuth } from '@/lib/auth/simple-auth';

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

    // Perform enhanced AI analysis
    const analysisResult = await processDataWithAI(companyId, timeRange);

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

    // Perform enhanced AI analysis
    const analysisResult = await processDataWithAI(companyId, timeRange);

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
