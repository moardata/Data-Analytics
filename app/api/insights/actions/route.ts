/**
 * Insights Actions API
 * Handles Mark as Done and View Details actions for insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
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
    const { action, insightId, insightData } = body;

    console.log(`🎯 [Insights Actions] ${action} for insight ${insightId}`);

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

    if (action === 'mark_done') {
      // Update insight status to completed
      const { error: updateError } = await supabase
        .from('insights')
        .update({
          metadata: {
            status: 'done',
            completed_at: new Date().toISOString(),
            action_taken: true
          }
        })
        .eq('id', insightId)
        .eq('client_id', clientId);

      if (updateError) {
        console.error('Error marking insight as done:', updateError);
        return NextResponse.json(
          { error: 'Failed to mark insight as done' },
          { status: 500 }
        );
      }

      console.log(`✅ [Insights Actions] Marked insight ${insightId} as done`);

    } else if (action === 'view_details') {
      // Track that the insight was viewed
      const { error: updateError } = await supabase
        .from('insights')
        .update({
          metadata: {
            status: 'viewed',
            viewed_at: new Date().toISOString(),
            view_count: 1
          }
        })
        .eq('id', insightId)
        .eq('client_id', clientId);

      if (updateError) {
        console.error('Error tracking insight view:', updateError);
        return NextResponse.json(
          { error: 'Failed to track insight view' },
          { status: 500 }
        );
      }

      console.log(`👁️ [Insights Actions] Tracked view for insight ${insightId}`);

    } else if (action === 'create_insight') {
      // Create a new insight
      const { error: createError } = await supabase
        .from('insights')
        .insert({
          client_id: clientId,
          title: insightData.title,
          content: insightData.summary,
          insight_type: insightData.category,
          metadata: {
            confidence: insightData.confidence,
            severity: insightData.severity,
            status: 'new',
            created_at: new Date().toISOString(),
            data_points: insightData.dataPoints,
            affected_students: insightData.affectedStudents,
            ai_generated: true,
            structured_analysis: true
          }
        });

      if (createError) {
        console.error('Error creating insight:', createError);
        return NextResponse.json(
          { error: 'Failed to create insight' },
          { status: 500 }
        );
      }

      console.log(`📝 [Insights Actions] Created new insight: ${insightData.title}`);

    } else {
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      insightId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [Insights Actions] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process insight action',
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
    const status = searchParams.get('status') || 'all';

    console.log(`📊 [Insights Actions] Fetching insights for company ${companyId} (status: ${status})`);

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

    // Build query based on status filter
    let query = supabase
      .from('insights')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('metadata->status', status);
    }

    const { data: insights, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching insights:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch insights' },
        { status: 500 }
      );
    }

    // Format insights for display
    const formattedInsights = insights?.map(insight => ({
      id: insight.id,
      title: insight.title,
      summary: insight.content,
      confidence: insight.metadata?.confidence || 0,
      category: insight.insight_type || 'general',
      severity: insight.metadata?.severity || 'warning',
      status: insight.metadata?.status || 'new',
      createdAt: insight.created_at,
      details: insight.content,
      recommendations: [insight.content],
      dataPoints: insight.metadata?.data_points || 0,
      affectedStudents: insight.metadata?.affected_students || 0
    })) || [];

    return NextResponse.json({
      success: true,
      insights: formattedInsights,
      total: formattedInsights.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [Insights Actions] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch insights',
        details: error.stack 
      },
      { status: 500 }
    );
  }
}
