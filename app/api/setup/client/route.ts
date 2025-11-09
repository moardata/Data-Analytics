/**
 * Setup Client API Endpoint
 * Creates a client record for a new company accessing the app
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

// CORS headers restricted to Whop domain for security
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://whop.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, companyName, companyEmail } = await request.json();

    console.log('🔧 [Setup Client] Request:', { companyId, companyName, companyEmail });

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if Supabase is available
    if (!supabase) {
      console.warn('⚠️ Supabase not available, returning mock response');
      return NextResponse.json({
        message: 'Client created (mock mode)',
        clientId: 'mock_client_' + companyId,
        tier: 'starter',
        subscriptionStatus: 'active',
        requiresSubscription: false,
      }, { headers: corsHeaders });
    }

    // Check if client already exists
    const { data: existing, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ [Setup Client] Error checking existing client:', checkError);
      // Don't fail - try to create anyway
    }

    if (existing) {
      console.log('✅ [Setup Client] Client already exists:', existing.id);
      return NextResponse.json({
        message: 'Client already exists',
        clientId: existing.id,
      }, { headers: corsHeaders });
    }

    console.log('🆕 [Setup Client] Creating new client...');

    // Create new client with 7-day free trial (REQUIRED by Whop App Store)
    // All new users get a free trial to explore functionality before paying
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7-day trial

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        whop_user_id: companyId,
        company_id: companyId,
        email: companyEmail || `company_${companyId}@whop.com`,
        name: companyName || `Company ${companyId}`,
        current_tier: 'starter', // Starter tier for trial
        subscription_tier: 'starter', // Required field
        subscription_status: 'trialing', // Trial status
        trial_ends_at: trialEndsAt.toISOString(), // 7-day trial
        whop_plan_id: null, // No plan yet (trial doesn't require purchase)
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ [Setup Client] Error creating client:', error);
      console.error('❌ [Setup Client] Error details:', JSON.stringify(error, null, 2));
      
      // Return a more helpful error message
      return NextResponse.json(
        { 
          error: 'Failed to create client record',
          details: error.message || 'Unknown database error',
          code: error.code,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('✅ [Setup Client] Client created successfully:', newClient.id);

    return NextResponse.json({
      message: 'Client record created - subscription required',
      clientId: newClient.id,
      tier: null,
      subscriptionStatus: 'none',
      requiresSubscription: true,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Setup client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}