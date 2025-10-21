import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

/**
 * Toggle Form Status API
 * Allows owners to publish/unpublish surveys to students
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, companyId, isActive } = body;

    if (!formId || !companyId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Form ID, Company ID, and isActive status are required' },
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

    // Update the form's active status
    const { data: updatedForm, error: updateError } = await supabase
      .from('form_templates')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', formId)
      .eq('client_id', clientData.id)
      .select()
      .single();

    if (updateError || !updatedForm) {
      return NextResponse.json(
        { error: 'Failed to update form status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      form: {
        id: updatedForm.id,
        name: updatedForm.name,
        is_active: updatedForm.is_active,
      },
      message: `Survey ${isActive ? 'published' : 'unpublished'} to students successfully!`
    });

  } catch (error: any) {
    console.error('Error toggling form status:', error);
    return NextResponse.json(
      { error: 'Failed to update form status' },
      { status: 500 }
    );
  }
}
