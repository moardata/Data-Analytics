/**
 * Debug Revenue Data
 * Shows what's actually in the database for debugging
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    // Get client
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (!clientData) {
      return NextResponse.json({
        error: 'No client found',
        companyId
      });
    }

    const clientId = clientData.id;

    // Get ALL data
    const [events, subscriptions, entities] = await Promise.all([
      supabase.from('events').select('*').eq('client_id', clientId).limit(100),
      supabase.from('subscriptions').select('*').eq('client_id', clientId),
      supabase.from('entities').select('*').eq('client_id', clientId),
    ]);

    return NextResponse.json({
      companyId,
      clientId: clientData.id,
      client: clientData,
      events: {
        count: events.data?.length || 0,
        types: events.data?.map(e => e.event_type) || [],
        sample: events.data?.slice(0, 3) || []
      },
      subscriptions: {
        count: subscriptions.data?.length || 0,
        data: subscriptions.data || []
      },
      entities: {
        count: entities.data?.length || 0,
        sample: entities.data?.slice(0, 3) || []
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    });
  }
}

