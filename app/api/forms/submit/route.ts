/**
 * Form Submission API Endpoint
 * Handles form submissions from students
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, entityId, companyId, responses } = body;

    if (!formId || !entityId || !companyId || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    const companyId = searchParams.get('companyId') || searchParams.get('clientId');
    const formId = searchParams.get('formId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
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



