/**
 * Form Creation API Endpoint
 * Creates new form templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, formData } = body;

    if (!companyId || !formData) {
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

    // Create form template
    const { data: formTemplate, error } = await supabase
      .from('form_templates')
      .insert({
        client_id: clientId,
        name: formData.name,
        description: formData.description,
        fields: formData.fields,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating form template:', error);
      return NextResponse.json(
        { error: 'Failed to create form template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      formTemplate,
    });

  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
}
