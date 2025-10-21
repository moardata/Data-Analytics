import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

/**
 * Get Active Forms API
 * Returns forms that are currently active for delivery
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const courseId = searchParams.get('courseId');

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

    // Get active forms for this client
    const { data: forms, error: formsError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('client_id', clientData.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (formsError) {
      return NextResponse.json(
        { error: 'Failed to fetch forms' },
        { status: 500 }
      );
    }

    // For demo purposes, return the first active form
    // In production, you'd have more sophisticated logic to determine
    // which form should be shown based on course, timing, etc.
    const activeForm = forms && forms.length > 0 ? forms[0] : null;

    return NextResponse.json({
      success: true,
      form: activeForm,
      totalForms: forms?.length || 0
    });

  } catch (error: any) {
    console.error('Error fetching active forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active forms' },
      { status: 500 }
    );
  }
}
