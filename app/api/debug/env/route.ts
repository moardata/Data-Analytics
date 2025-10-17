/**
 * Environment Variables Debug Endpoint
 * Shows what env vars are available (without exposing sensitive values)
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` : 'missing',
      
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : 'missing',
      
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      serviceKeyPreview: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
        `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...` : 'missing',
    },
    
    whop: {
      apiKey: !!process.env.WHOP_API_KEY,
      apiKeyLength: process.env.WHOP_API_KEY?.length || 0,
      
      appId: !!process.env.NEXT_PUBLIC_WHOP_APP_ID,
      companyId: !!process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
      
      bypassAuth: process.env.BYPASS_WHOP_AUTH,
    },
    
    openai: {
      apiKey: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    },
    
    allSupabaseKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
    allEnvKeys: Object.keys(process.env).filter(k => 
      k.includes('SUPABASE') || 
      k.includes('WHOP') || 
      k.includes('OPENAI')
    ),
    
    timestamp: new Date().toISOString(),
    version: 'v7-no-validation',
  };

  return NextResponse.json(envCheck);
}
