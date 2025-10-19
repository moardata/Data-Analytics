/**
 * Environment Variable Test Endpoint
 * Tests which variable names Vercel actually picks up
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Test all possible naming variations
  const envTests = {
    // Original attempts
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    
    // Alternative naming patterns
    SUPABASE_ADMIN_KEY: process.env.SUPABASE_ADMIN_KEY,
    SUPABASE_SERVER_KEY: process.env.SUPABASE_SERVER_KEY,
    SUPABASE_BACKEND_KEY: process.env.SUPABASE_BACKEND_KEY,
    SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,
    
    // Shorter names
    SUPA_KEY: process.env.SUPA_KEY,
    DB_KEY: process.env.DB_KEY,
    API_KEY: process.env.API_KEY,
    
    // With prefix
    NEXT_SUPABASE_KEY: process.env.NEXT_SUPABASE_KEY,
    APP_SUPABASE_KEY: process.env.APP_SUPABASE_KEY,
    
    // Public prefixed (shouldn't use for service role, but testing)
    NEXT_PUBLIC_SUPABASE_SERVICE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
    
    // Known working vars
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  // Convert to presence check
  const presenceCheck = Object.fromEntries(
    Object.entries(envTests).map(([key, val]) => [
      key, 
      {
        exists: !!val,
        preview: val ? val.substring(0, 20) + '...' : 'NOT SET',
        length: val?.length || 0,
      }
    ])
  );

  // Find which ones work
  const workingVars = Object.entries(presenceCheck)
    .filter(([_, data]) => data.exists)
    .map(([key, _]) => key);

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: `Found ${workingVars.length} environment variables`,
    workingVariables: workingVars,
    allTests: presenceCheck,
    recommendation: workingVars.length > 2 
      ? `Use one of these: ${workingVars.slice(2).join(', ')}`
      : 'Add a test variable in Vercel to see if it appears here',
  });
}

