import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

/**
 * Get Active Forms API
 * Returns all active forms for students to complete
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

    // Check if Supabase is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    // First, get the client record for this company
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get all active forms for this client
    const { data: forms, error: formsError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('client_id', clientData.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (formsError) {
      console.error('Error fetching forms:', formsError);
      return NextResponse.json(
        { error: 'Failed to fetch forms' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      forms: forms || [],
      count: forms?.length || 0
    });

  } catch (error: any) {
    console.error('Error in active forms API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}