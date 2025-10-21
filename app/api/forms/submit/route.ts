/**
 * Form Submission API Endpoint
 * Handles form submissions from students
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, entityId, companyId, responses } = body;

    console.log('📝 [Form Submit API] Received submission:', {
      formId,
      entityId,
      companyId,
      responsesCount: Object.keys(responses || {}).length,
      hasResponses: !!responses
    });

    if (!formId || !entityId || !companyId || !responses) {
      console.error('❌ [Form Submit API] Missing required fields:', {
        formId: !!formId,
        entityId: !!entityId,
        companyId: !!companyId,
        responses: !!responses
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, get the client record for this company
    console.log('🔍 [Form Submit API] Looking up client for company:', companyId);
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    console.log('📊 [Form Submit API] Client lookup result:', {
      found: !!clientData,
      clientId: clientData?.id,
      error: clientError?.message
    });

    if (clientError || !clientData) {
      console.error('❌ [Form Submit API] Client not found:', clientError);
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id; // This is the actual UUID

    // First, create or get the entity record
    console.log('👤 [Form Submit API] Creating/getting entity record for:', entityId);
    const { data: entityData, error: entityError } = await supabase
      .from('entities')
      .upsert({
        whop_user_id: entityId,
        client_id: clientId,
        name: `Student ${entityId}`,
        email: null,
        metadata: { source: 'form_submission' }
      }, {
        onConflict: 'client_id,whop_user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    console.log('📊 [Form Submit API] Entity result:', {
      success: !!entityData,
      entityId: entityData?.id,
      error: entityError?.message
    });

    if (entityError || !entityData) {
      console.error('❌ [Form Submit API] Entity creation failed:', entityError);
      throw new Error(`Failed to create entity: ${entityError?.message}`);
    }

    // Store form submission
    console.log('💾 [Form Submit API] Storing form submission:', {
      formId,
      entityId: entityData.id,
      clientId,
      responsesCount: Object.keys(responses).length
    });

    const { data: submission, error } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formId,
        entity_id: entityData.id,
        client_id: clientId,
        responses,
      })
      .select()
      .single();

    console.log('📊 [Form Submit API] Submission result:', {
      success: !!submission,
      submissionId: submission?.id,
      error: error?.message
    });

    if (error) {
      console.error('❌ [Form Submit API] Database error:', error);
      throw error;
    }

    // Also create an event for the form submission
    await supabase
      .from('events')
      .insert({
        client_id: clientId,
        entity_id: entityData.id,
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

  } catch (error: any) {
    console.error('❌ [Form Submit API] Error submitting form:', error);
    console.error('❌ [Form Submit API] Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });
    return NextResponse.json(
      { 
        error: 'Failed to submit form',
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Use simple auth (never hangs)
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');

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



