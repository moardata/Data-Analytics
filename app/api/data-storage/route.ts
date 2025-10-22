/**
 * Enhanced Data Storage API
 * Manages insights storage with timestamps, metadata, and progress tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  storeInsightWithMetadata, 
  trackAIRunWithMetadata, 
  updateAIRunStatus,
  getInsightsWithMetadata,
  getDataStorageHistory,
  updateInsightStatus,
  getInsightsStatistics
} from '@/lib/utils/dataStorage';
import { simpleAuth } from '@/lib/auth/simple-auth';
import { supabaseServer as supabase } from '@/lib/supabase-server';

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
    const { action, data } = body;

    console.log(`💾 [Data Storage] ${action} for company ${companyId}`);

    // Get the client record for multi-tenant isolation
    const { data: clientData, error: clientError } = await supabase
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

    let result: any = null;

    switch (action) {
      case 'store_insight':
        result = await storeInsightWithMetadata({
          ...data,
          clientId
        });
        break;

      case 'track_ai_run':
        result = await trackAIRunWithMetadata({
          ...data,
          clientId
        });
        break;

      case 'update_ai_run_status':
        result = await updateAIRunStatus(data.runId, data.status, data.metadata);
        break;

      case 'update_insight_status':
        result = await updateInsightStatus(data.insightId, data.status, data.additionalMetadata);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [Data Storage] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process data storage action',
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
    const action = searchParams.get('action') || 'get_insights';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`📊 [Data Storage] ${action} for company ${companyId}`);

    // Get the client record for multi-tenant isolation
    const { data: clientData, error: clientError } = await supabase
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

    let result: any = null;

    switch (action) {
      case 'get_insights':
        result = await getInsightsWithMetadata(clientId, {
          status: status || undefined,
          category: category || undefined,
          limit,
          offset
        });
        break;

      case 'get_history':
        result = await getDataStorageHistory(clientId, limit);
        break;

      case 'get_statistics':
        result = await getInsightsStatistics(clientId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [Data Storage] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch data storage information',
        details: error.stack 
      },
      { status: 500 }
    );
  }
}
