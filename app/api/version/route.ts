import { NextResponse } from 'next/server';
import { SUPABASE_SERVICE_KEY } from '@/lib/env-config';

export async function GET() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseKey = process.env.SUPABASE_KEY;
  const configKey = SUPABASE_SERVICE_KEY;
  
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
      configFileKey: {
        configured: !!configKey,
        length: configKey?.length || 0,
        preview: configKey ? configKey.substring(0, 15) + '...' : 'Not set',
        status: configKey ? '✅ WORKING' : '❌ FAILED'
      },
      usingKey: configKey ? 'Available via config file ✅' : 'MISSING ❌',
      lastRedeploy: new Date().toISOString()
    },
    message: 'Testing both SUPABASE_SERVICE_ROLE_KEY and SUPABASE_KEY'
  });
}

