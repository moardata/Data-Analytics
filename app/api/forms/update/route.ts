/**
 * Form Update API Endpoint
 * Updates existing form templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, companyId, formData } = body;

    if (!formId || !companyId || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id; // This is the actual UUID

    // Verify the form belongs to this client
    const { data: existingForm, error: verifyError } = await supabase
      .from('form_templates')
      .select('id')
      .eq('id', formId)
      .eq('client_id', clientId)
      .single();

    if (verifyError || !existingForm) {
      return NextResponse.json(
        { error: 'Form not found or access denied' },
        { status: 404 }
      );
    }

    // Update form template
    const { data: updatedForm, error: updateError } = await supabase
      .from('form_templates')
      .update({
        name: formData.name,
        description: formData.description,
        fields: formData.fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', formId)
      .eq('client_id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating form template:', updateError);
      return NextResponse.json(
        { error: 'Failed to update form template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      formTemplate: updatedForm,
    });

  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
}


