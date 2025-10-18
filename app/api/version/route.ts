import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  return NextResponse.json({
    version: 'v10-supabase-key-test',
    timestamp: new Date().toISOString(),
    webhookConfig: {
      validationEnabled: false,
      note: 'All webhook validation is completely disabled for testing'
    },
    supabaseConfig: {
      serviceRoleKey: {
        configured: !!supabaseServiceRoleKey,
        length: supabaseServiceRoleKey?.length || 0,
        preview: supabaseServiceRoleKey ? supabaseServiceRoleKey.substring(0, 15) + '...' : 'Not set'
      },
      supabaseKeyAlt: {
        configured: !!supabaseKey,
        length: supabaseKey?.length || 0,
        preview: supabaseKey ? supabaseKey.substring(0, 15) + '...' : 'Not set'
      },
      usingKey: supabaseServiceRoleKey || supabaseKey ? 'Available' : 'MISSING',
      lastRedeploy: new Date().toISOString()
    },
    message: 'Testing both SUPABASE_SERVICE_ROLE_KEY and SUPABASE_KEY'
  });
}

