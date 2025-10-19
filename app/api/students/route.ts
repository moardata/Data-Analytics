/**
 * Students API Endpoint
 * Fetches student (entity) data for a specific company
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await simpleAuth(request);
    const { companyId } = auth;

    console.log('📚 [Students API] Fetching students for company:', companyId);
    console.log('🔍 [Students API] Supabase server check:', {
      hasSupabase: !!supabase,
      type: typeof supabase,
    });

    // First get the client record for this company
    console.log('🔍 [Students API] Querying clients table for company_id:', companyId);
    
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle();

    console.log('📊 [Students API] Client query result:', {
      found: !!clientData,
      clientId: clientData?.id,
      error: clientError?.message,
      errorCode: clientError?.code,
    });

    if (clientError) {
      console.error('❌ [Students API] Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Database error', details: clientError.message, students: [] },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!clientData) {
      console.log('❌ [Students API] No client found for company:', companyId);
      return NextResponse.json(
        { error: 'Client not found', students: [] },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log('✅ [Students API] Client found:', clientData.id);

    // Now query entities with the actual client UUID
    console.log('🔍 [Students API] Querying entities table for client_id:', clientData.id);
    
    const { data: students, error: studentsError } = await supabase
      .from('entities')
      .select('*')
      .eq('client_id', clientData.id)
      .order('created_at', { ascending: false });

    console.log('📊 [Students API] Students query result:', {
      count: students?.length || 0,
      error: studentsError?.message,
      errorCode: studentsError?.code,
      firstStudent: students?.[0]?.name || 'none',
    });

    if (studentsError) {
      console.error('❌ [Students API] Error fetching students:', studentsError);
      return NextResponse.json(
        { error: 'Failed to fetch students', details: studentsError.message, students: [] },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`✅ [Students API] Found ${students?.length || 0} students`);

    return NextResponse.json(
      { students: students || [] },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ [Students API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students', details: error.message, students: [] },
      { status: 500, headers: corsHeaders }
    );
  }
}

