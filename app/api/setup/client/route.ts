/**
 * Setup Client API Endpoint
 * Creates a client record for a new company accessing the app
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { companyId, companyName, companyEmail } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400 }
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
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({
        message: 'Client already exists',
        clientId: existing.id,
      });
    }

    // Create new client record
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        whop_user_id: companyId,
        company_id: companyId,
        email: companyEmail || `company_${companyId}@whop.com`,
        name: companyName || `Company ${companyId}`,
        subscription_tier: 'atom', // Legacy field
        current_tier: 'atom', // Start with free tier
        subscription_status: 'active',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return NextResponse.json(
        { error: 'Failed to create client record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Client created successfully',
      clientId: newClient.id,
    });

  } catch (error) {
    console.error('Setup client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}