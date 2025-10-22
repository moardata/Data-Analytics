import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { action, insightId, improvement, metrics } = await request.json();
    
    const supabase = createClient();
    
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
    const clientId = searchParams.get('clientId');
    const actionType = searchParams.get('actionType');
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get actions taken by this client
    let query = supabase
      .from('insight_actions')
      .select(`
        *,
        insights!inner(
          id,
          title,
          company_id
        )
      `)
      .eq('insights.company_id', clientId)
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
