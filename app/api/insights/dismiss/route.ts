/**
 * Dismiss Insights API
 * Mark insights as dismissed/read
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { insightId, dismissed = true, companyId } = await request.json();

    if (!insightId) {
      return NextResponse.json(
        { error: 'insightId is required' },
        { status: 400 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
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

    // Verify the insight belongs to this client
    const { data: insight, error: insightError } = await supabase
      .from('insights')
      .select('id, client_id')
      .eq('id', insightId)
      .eq('client_id', clientId)
      .single();

    if (insightError || !insight) {
      return NextResponse.json(
        { error: 'Insight not found or access denied' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('insights')
      .update({ dismissed })
      .eq('id', insightId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      insight: data
    });

  } catch (error: any) {
    console.error('Error dismissing insight:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to dismiss insight' },
      { status: 500 }
    );
  }
}



