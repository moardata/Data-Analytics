/**
 * Refresh Insights API
 * Refreshes insights for a client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyId } from '@/lib/auth/whop-auth';
import { generateInsightsForClient } from '@/lib/utils/aiInsights';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
        { status: 404 }
      );
    }

    const clientId = clientData.id; // This is the actual UUID

    // Generate new insights
    const insights = await generateInsightsForClient(clientId, 'week');
    
    return NextResponse.json({
      success: true,
      insights: insights.length,
      message: 'Insights refreshed successfully'
    });

  } catch (error: any) {
    console.error('Error refreshing insights:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh insights' },
      { status: 500 }
    );
  }
}


