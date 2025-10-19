/**
 * Supabase Debug Endpoint
 * Check if Supabase is properly configured in Vercel
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Check all possible environment variable names
    const allEnvVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
    };

    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_SECRET_KEY: !!process.env.SUPABASE_SECRET_KEY,
      SUPABASE_KEY: !!process.env.SUPABASE_KEY,
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 35) || 'NOT SET',
      keyPreview: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 25) || 'NOT SET',
      anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 25) || 'NOT SET',
    };

    console.log('🔍 [Supabase Debug] Environment variables:', envCheck);
    console.log('🔍 [Supabase Debug] Raw env vars (first 30 chars):', 
      Object.fromEntries(
        Object.entries(allEnvVars).map(([key, val]) => [key, val ? val.substring(0, 30) + '...' : 'NOT SET'])
      )
    );

    // Try to query the database
    let queryTest = null;
    let queryError = null;

    try {
      const result = await supabaseServer
        .from('clients')
        .select('id, company_id')
        .eq('company_id', 'biz_3GYHNPbGkZCEky')
        .maybeSingle();

      queryTest = {
        success: !!result.data,
        clientId: result.data?.id,
        error: result.error?.message,
      };
      queryError = result.error;
    } catch (e: any) {
      queryTest = {
        success: false,
        error: e.message,
      };
      queryError = e;
    }

    console.log('🔍 [Supabase Debug] Query test:', queryTest);

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      queryTest,
      supabaseAvailable: !!supabaseServer,
      message: queryTest.success 
        ? '✅ Supabase is working!' 
        : '❌ Supabase query failed - check environment variables',
    });

  } catch (error: any) {
    console.error('❌ [Supabase Debug] Error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

