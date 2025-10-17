import { NextResponse } from 'next/server';

export async function GET() {
  const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  return NextResponse.json({
    version: 'v7-no-validation',
    timestamp: new Date().toISOString(),
    webhookConfig: {
      validationEnabled: false,
      note: 'All webhook validation is completely disabled for testing'
    },
    supabaseConfig: {
      serviceRoleKeyConfigured: hasSupabaseKey
    },
    message: 'Webhook validation completely removed - ready for testing'
  });
}

