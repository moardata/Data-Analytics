import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

/**
 * Debug Forms API
 * Shows all forms in the database for debugging
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
      .select('id, company_id')
      .eq('company_id', companyId)
      .single();

    console.log('🔍 [Debug Forms] Client query result:', {
      found: !!clientData,
      clientId: clientData?.id,
      companyId: clientData?.company_id,
      error: clientError?.message
    });

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Company not found', details: clientError?.message },
        { status: 404 }
      );
    }

    // Get ALL forms for this client (both active and inactive)
    const { data: allForms, error: allFormsError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('client_id', clientData.id)
      .order('created_at', { ascending: false });

    console.log('📊 [Debug Forms] All forms query result:', {
      found: allForms?.length || 0,
      forms: allForms?.map(f => ({ id: f.id, name: f.name, is_active: f.is_active, created_at: f.created_at })),
      error: allFormsError?.message
    });

    // Get only active forms
    const { data: activeForms, error: activeFormsError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('client_id', clientData.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    console.log('📊 [Debug Forms] Active forms query result:', {
      found: activeForms?.length || 0,
      forms: activeForms?.map(f => ({ id: f.id, name: f.name, is_active: f.is_active })),
      error: activeFormsError?.message
    });

    return NextResponse.json({
      success: true,
      companyId,
      clientId: clientData.id,
      allForms: allForms || [],
      activeForms: activeForms || [],
      totalForms: allForms?.length || 0,
      activeFormsCount: activeForms?.length || 0
    });

  } catch (error: any) {
    console.error('Error in debug forms API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
