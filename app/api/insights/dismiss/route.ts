/**
 * Dismiss Insights API
 * Mark insights as dismissed/read
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { insightId, dismissed = true } = await request.json();

    if (!insightId) {
      return NextResponse.json(
        { error: 'insightId is required' },
        { status: 400 }
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



