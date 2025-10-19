/**
 * Events Ingest API Route
 * Allows manual logging of custom events for tracking and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { whopSdk } from '@/lib/whop-sdk';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access using Whop SDK
    const h = await headers();
    const tokenResult = await whopSdk.verifyUserToken(h);
    
    // Use test user if no userId (local development mode)
    const userId = tokenResult?.userId || 'test_user';
    
    // Parse request body
    const body = await request.json();
    const { companyId, eventType, eventData, memberId } = body;
    
    // Validate required fields
    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing required field: companyId' },
        { status: 400 }
      );
    }
    
    if (!eventType) {
      return NextResponse.json(
        { error: 'Missing required field: eventType' },
        { status: 400 }
      );
    }
    
    // Check if user has admin access to this company
    const accessCheck = await whopSdk.access.checkIfUserHasAccessToCompany({
      userId,
      companyId,
    });
    
    if (!accessCheck.hasAccess || accessCheck.accessLevel !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Look up the client record for this company
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
    
    const clientId = clientData.id;
    
    // Look up entity if memberId provided
    let entityId: string | null = null;
    
    if (memberId) {
      const { data: entityData, error: entityError } = await supabase
        .from('entities')
        .select('id')
        .eq('whop_user_id', memberId)
        .eq('client_id', clientId)
        .single();
      
      if (entityError || !entityData) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        );
      }
      
      entityId = entityData.id;
    }
    
    // Insert event into events table
    const { data: eventRecord, error: eventError } = await supabase
      .from('events')
      .insert({
        client_id: clientId,
        entity_id: entityId,
        event_type: eventType,
        event_data: eventData || {},
        metadata: {
          source: 'manual_ingest',
          ingested_by: userId,
          ingested_at: new Date().toISOString(),
        },
      })
      .select()
      .single();
    
    if (eventError) {
      console.error('Error inserting event:', eventError);
      return NextResponse.json(
        { error: 'Failed to insert event', details: eventError.message },
        { status: 500 }
      );
    }
    
    console.log(`Manual event ingested: ${eventType} for company ${companyId}`);
    
    return NextResponse.json({
      ok: true,
      event: {
        id: eventRecord.id,
        type: eventType,
        created_at: eventRecord.created_at,
      },
      message: 'Event ingested successfully',
    });
    
  } catch (error: any) {
    console.error('Events ingest error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

