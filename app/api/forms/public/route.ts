import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { ensureUniqueFieldIds } from '@/lib/utils/formHelpers';

/**
 * Public Form Access API
 * Allows students to access forms without authentication
 * Used for sharing forms via public URLs
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const companyId = searchParams.get('companyId');

    if (!formId || !companyId) {
      return NextResponse.json(
        { error: 'Form ID and Company ID are required' },
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

    // Get the form template
    const { data: form, error: formError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('id', formId)
      .eq('client_id', clientData.id)
      .eq('is_active', true)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    // Ensure all field IDs are unique (fix for existing forms with duplicate IDs)
    const fieldsWithUniqueIds = ensureUniqueFieldIds(form.fields);

    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        description: form.description,
        fields: fieldsWithUniqueIds,
        is_active: form.is_active,
      },
    });

  } catch (error: any) {
    console.error('Error fetching public form:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}
