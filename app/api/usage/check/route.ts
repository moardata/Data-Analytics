/**
 * Usage Check API
 * Check if client can perform an action based on their tier limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || searchParams.get('clientId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400 }
      );
    }

    // Get client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, current_tier')
      .eq('company_id', companyId)
      .maybeSingle();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Return tier information
    return NextResponse.json({
      tier: clientData.current_tier || 'atom',
      canPerform: true, // For now, allow all actions
    });

  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}