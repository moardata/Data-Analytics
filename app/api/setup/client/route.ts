/**
 * Setup Client API
 * Creates a client record for testing purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyId } from '@/lib/auth/whop-auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if client already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (existingClient) {
      return NextResponse.json({
        message: 'Client already exists',
        client: existingClient,
      });
    }

    // Create new client record
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        company_id: companyId,
        current_tier: 'atom',
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Client created successfully',
      client: newClient,
    });

  } catch (error: any) {
    console.error('Error setting up client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup client' },
      { status: 500 }
    );
  }
}
