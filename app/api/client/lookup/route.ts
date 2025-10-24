import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

/**
 * Client ID Lookup API
 * Converts companyId to client UUID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get the client record for this company
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

    return NextResponse.json({
      success: true,
      clientId: clientData.id,
      companyId
    });

  } catch (error: any) {
    console.error('Error looking up client:', error);
    return NextResponse.json(
      { error: 'Failed to lookup client' },
      { status: 500 }
    );
  }
}


