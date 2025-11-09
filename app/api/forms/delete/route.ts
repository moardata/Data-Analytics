/**
 * Form Deletion API Endpoint
 * Deletes a form template
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { requireOwner } from '@/lib/auth/auth-helpers';

export async function DELETE(request: NextRequest) {
  try {
    // Require owner/admin access
    const auth = await requireOwner(request);
    const companyId = auth.companyId;
    
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');

    if (!formId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    const clientId = clientData.id;

    // Delete the form (cascade will handle submissions)
    const { error } = await supabase
      .from('form_templates')
      .delete()
      .eq('id', formId)
      .eq('client_id', clientId);

    if (error) {
      console.error('Error deleting form:', error);
      return NextResponse.json(
        { error: 'Failed to delete form' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Form deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}







