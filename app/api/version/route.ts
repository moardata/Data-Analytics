import { NextResponse } from 'next/server';

export async function GET() {
  const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0;
  
  return NextResponse.json({
    version: 'v9-force-redeploy',
    timestamp: new Date().toISOString(),
    webhookConfig: {
      validationEnabled: false,
      note: 'All webhook validation is completely disabled for testing'
    },
    supabaseConfig: {
      serviceRoleKeyConfigured: hasSupabaseKey,
      keyLength: keyLength > 0 ? `${keyLength} characters` : 'Not set',
      lastRedeploy: new Date().toISOString()
    },
    message: 'Webhook validation completely removed - ready for testing'
  });
}

