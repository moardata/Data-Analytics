/**
 * Form Submission API Endpoint
 * Handles form submissions from students
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';
import { checkLimit } from '@/lib/pricing/usage-tracker';
import { type TierName } from '@/lib/pricing/tiers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, entityId, companyId, responses } = body;

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
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, current_tier')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      console.error('❌ [Form Submit API] Client not found:', clientError);
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id; // This is the actual UUID
    const tier = (clientData.current_tier || 'atom') as TierName;

    // CHECK RESPONSE LIMIT BEFORE ACCEPTING SUBMISSION
    const limitCheck = await checkLimit(companyId, tier, 'analyzeResponse');
    
    if (!limitCheck.allowed) {
      console.warn('⚠️ [Form Submit API] Response limit reached:', limitCheck);
      
      // Calculate when limit resets (first day of next month)
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      
      return NextResponse.json(
        { 
          error: limitCheck.reason,
          limitReached: true,
          details: {
            current: limitCheck.current,
            limit: limitCheck.limit,
            tier: tier,
            feature: 'Form Responses',
            resetPeriod: 'monthly',
            resetDate: nextMonth.toISOString()
          },
          upgrade: { 
            message: 'Upgrade to analyze more responses per month',
            url: `/upgrade?companyId=${companyId}`,
            recommendedTier: tier === 'atom' ? 'core' : 'pulse'
          },
        },
        { status: 429 } // Too Many Requests
      );
    }

    // First, check if entity already exists
    let entityData: any = null;
    
    const { data: existingEntity } = await supabase
      .from('entities')
      .select('*')
      .eq('client_id', clientId)
      .eq('whop_user_id', entityId)
      .single();

    if (existingEntity) {
      entityData = existingEntity;
    } else {
      // Entity doesn't exist, create it with Whop user data
      
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
            
            if (userData.username) userName = userData.username;
            if (userData.email) userEmail = userData.email;
            if (userData.profile_picture_url || userData.avatar) {
              metadata.avatar_url = userData.profile_picture_url || userData.avatar;
            }
            if (userData.profile_pic_url) metadata.avatar_url = userData.profile_pic_url;
          } else {
          }
        }
      } catch (whopError) {
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
    }

    if (!entityData) {
      console.error('❌ [Form Submit API] Entity creation failed: No entity data');
      throw new Error('Failed to create or retrieve entity');
    }

    // Store form submission
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



