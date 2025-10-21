import { NextRequest, NextResponse } from 'next/server';
import { getStudentAllowedSurveys } from '@/lib/auth/student-access';
import { supabaseServer as supabase } from '@/lib/supabase-server';

/**
 * Student Surveys API
 * Returns only surveys that are live and enabled for students
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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
    console.log('🔍 [Student Surveys API] Fetching forms for client:', clientData.id);
    const { data: forms, error: formsError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('client_id', clientData.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    console.log('📊 [Student Surveys API] Forms query result:', {
      found: forms?.length || 0,
      forms: forms?.map(f => ({ id: f.id, name: f.name, is_active: f.is_active })),
      error: formsError?.message
    });

    if (formsError) {
      console.error('Error fetching forms:', formsError);
      return NextResponse.json(
        { error: 'Failed to fetch forms' },
        { status: 500 }
      );
    }

    // Get surveys allowed for this student (for access control)
    const allowedSurveys = await getStudentAllowedSurveys(companyId, userId);
    
    // Convert forms to survey format and filter by access
    const studentSurveys = (forms || []).map(form => ({
      id: form.id,
      name: form.name,
      description: form.description || 'Complete this survey to help improve our community',
      fields: form.fields || [],
      estimatedTime: '5', // Default estimate
      deadline: null, // No deadline for now
      completed: false, // TODO: Check if student completed this survey
      completedAt: null
    })).filter(survey => 
      allowedSurveys.some(allowed => allowed.surveyId === survey.id) || allowedSurveys.length === 0
    );

    return NextResponse.json({
      success: true,
      surveys: studentSurveys,
      total: studentSurveys.length,
      allowedSurveyIds: allowedSurveys.map(s => s.surveyId)
    });

  } catch (error: any) {
    console.error('Error fetching student surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}
