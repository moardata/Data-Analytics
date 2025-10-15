/**
 * Form Submission API Endpoint
 * Handles form submissions from students
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, entityId, clientId, responses } = body;

    if (!formId || !entityId || !clientId || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store form submission
    const { data: submission, error } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formId,
        entity_id: entityId,
        client_id: clientId,
        responses,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Also create an event for the form submission
    await supabase
      .from('events')
      .insert({
        client_id: clientId,
        entity_id: entityId,
        event_type: 'form_submission',
        event_data: {
          form_id: formId,
          submission_id: submission.id,
          response_count: Object.keys(responses).length,
        },
      });

    return NextResponse.json({
      success: true,
      submission,
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const formId = searchParams.get('formId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('form_submissions')
      .select('*')
      .eq('client_id', clientId)
      .order('submitted_at', { ascending: false });

    if (formId) {
      query = query.eq('form_id', formId);
    }

    const { data: submissions, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      submissions: submissions || [],
    });

  } catch (error) {
    console.error('Error fetching form submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}



