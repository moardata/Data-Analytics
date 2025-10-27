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

    // First, check if entity already exists
    console.log('👤 [Form Submit API] Looking up entity record for:', entityId);
    let entityData: any = null;
    
    const { data: existingEntity } = await supabase
      .from('entities')
      .select('*')
      .eq('client_id', clientId)
      .eq('whop_user_id', entityId)
      .single();

    if (existingEntity) {
      entityData = existingEntity;
      console.log('✅ [Form Submit API] Found existing entity:', entityData.id);
    } else {
      // Entity doesn't exist, create it with Whop user data
      console.log('🔍 [Form Submit API] Fetching user data from Whop for:', entityId);
      
      let userName = `Student ${entityId}`;
      let userEmail = null;
      let metadata: any = { source: 'form_submission' };
      
      // Try to fetch user info from Whop API
      try {
        const whopApiKey = process.env.WHOP_API_KEY;
        if (whopApiKey && !entityId.startsWith('user_biz_')) {
          const userResponse = await fetch(`https://api.whop.com/api/v5/users/${entityId}`, {
            headers: {
              'Authorization': `Bearer ${whopApiKey}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('✅ [Form Submit API] Got user data from Whop:', { 
              username: userData.username,
              hasAvatar: !!(userData.profile_picture_url || userData.avatar)
            });
            
            if (userData.username) userName = userData.username;
            if (userData.email) userEmail = userData.email;
            if (userData.profile_picture_url || userData.avatar) {
              metadata.avatar_url = userData.profile_picture_url || userData.avatar;
            }
            if (userData.profile_pic_url) metadata.avatar_url = userData.profile_pic_url;
          } else {
            console.log('⚠️ [Form Submit API] Whop API returned:', userResponse.status);
          }
        }
      } catch (whopError) {
        console.log('⚠️ [Form Submit API] Could not fetch user from Whop:', whopError);
      }

      // Create new entity with enriched data
      const { data: newEntity, error: entityError } = await supabase
        .from('entities')
        .insert({
          whop_user_id: entityId,
          client_id: clientId,
          name: userName,
          email: userEmail,
          metadata
        })
        .select()
        .single();

      if (entityError || !newEntity) {
        console.error('❌ [Form Submit API] Entity creation failed:', entityError);
        throw new Error(`Failed to create entity: ${entityError?.message}`);
      }

      entityData = newEntity;
      console.log('✅ [Form Submit API] Created new entity with Whop data:', entityData.id);
    }

    const { error: entityError } = { error: null }; // For backward compatibility

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



