/**
 * Survey Completion Tracking API
 * Tracks which surveys a student has completed
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const whopUserId = searchParams.get('whopUserId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get client ID
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // If no whopUserId, return empty (student not logged in yet)
    if (!whopUserId) {
      return NextResponse.json({
        success: true,
        completedFormIds: []
      });
    }

    // Find entity by whop_user_id
    const { data: entityData } = await supabase
      .from('entities')
      .select('id')
      .eq('client_id', clientData.id)
      .eq('whop_user_id', whopUserId)
      .single();

    if (!entityData) {
      // Entity doesn't exist yet, no completions
      return NextResponse.json({
        success: true,
        completedFormIds: []
      });
    }

    // Get all submissions for this entity
    const { data: submissions } = await supabase
      .from('form_submissions')
      .select('form_id')
      .eq('client_id', clientData.id)
      .eq('entity_id', entityData.id);

    const completedFormIds = submissions?.map(s => s.form_id) || [];

    return NextResponse.json({
      success: true,
      completedFormIds
    });
  } catch (error) {
    console.error('Error fetching completions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completions' },
      { status: 500 }
    );
  }
}

