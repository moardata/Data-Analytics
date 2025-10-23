import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { action, insightId, improvement, metrics } = await request.json();
    
    // Use the imported supabase client
    
    // Store the action taken by creator
    const { data: actionData, error: actionError } = await supabase
      .from('insight_actions')
      .insert({
        insight_id: insightId,
        action_type: action,
        improvement_description: improvement,
        metrics_before: metrics?.before || null,
        metrics_after: metrics?.after || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (actionError) {
      console.error('Error storing action:', actionError);
      return NextResponse.json({ error: 'Failed to store action' }, { status: 500 });
    }

    // Update insight status to "action_taken"
    const { error: updateError } = await supabase
      .from('insights')
      .update({ 
        status: 'action_taken',
        updated_at: new Date().toISOString()
      })
      .eq('id', insightId);

    if (updateError) {
      console.error('Error updating insight status:', updateError);
    }

    return NextResponse.json({ 
      success: true, 
      actionId: actionData.id,
      message: 'Action recorded successfully' 
    });

  } catch (error) {
    console.error('Feedback loop error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get('companyId') || searchParams.get('clientId');
    const actionType = searchParams.get('actionType');
    
    if (!companyIdParam) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    // Get the client record for this company
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyIdParam)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id; // This is the actual UUID
    
    // Get actions taken by this client
    let query = supabase
      .from('insight_actions')
      .select(`
        *,
        insights!inner(
          id,
          title,
          client_id
        )
      `)
      .eq('insights.client_id', clientId)
      .order('created_at', { ascending: false });

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    const { data: actions, error } = await query;

    if (error) {
      console.error('Error fetching actions:', error);
      return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
    }

    return NextResponse.json({ actions });

  } catch (error) {
    console.error('Feedback loop GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
