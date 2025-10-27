/**
 * Setup Client API Endpoint
 * Creates a client record for a new company accessing the app
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

// Add CORS headers for iframe compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if client already exists
    const { data: existing, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing client:', checkError);
      return NextResponse.json(
        { error: 'Database error checking client' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (existing) {
      return NextResponse.json({
        message: 'Client already exists',
        clientId: existing.id,
      }, { headers: corsHeaders });
    }

    // Calculate trial end date (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Create new client record with automatic free trial
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        whop_user_id: companyId,
        company_id: companyId,
        email: companyEmail || `company_${companyId}@whop.com`,
        name: companyName || `Company ${companyId}`,
        current_tier: 'atom', // Start with Starter tier during trial
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return NextResponse.json(
        { error: 'Failed to create client record' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      message: 'Client created successfully with 7-day free trial',
      clientId: newClient.id,
      trialEndsAt: trialEndsAt.toISOString(),
      tier: 'atom',
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Setup client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}