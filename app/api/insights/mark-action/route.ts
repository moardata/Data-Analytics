/**
 * Mark Insight as Actioned API
 * Updates insight status when creator takes action
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { insightId } = body;

    if (!insightId) {
      return NextResponse.json(
        { error: 'Insight ID is required' },
        { status: 400 }
      );
    }

    // Update insight status to action_taken
    const { error } = await supabase
      .from('insights')
      .update({ 
        status: 'action_taken',
        updated_at: new Date().toISOString()
      })
      .eq('id', insightId);

    if (error) {
      console.error('Error marking insight as actioned:', error);
      return NextResponse.json(
        { error: 'Failed to update insight' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Insight marked as actioned'
    });

  } catch (error) {
    console.error('Error in mark-action API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

