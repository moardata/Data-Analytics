import { NextResponse } from 'next/server';

export async function GET() {
  // Direct check - no imports, no dependencies
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const altKey = process.env.SUPABASE_KEY;
  
  // Find ANY env var with SUPABASE in the name
  const allEnvKeys = Object.keys(process.env);
  const supabaseKeys = allEnvKeys.filter(k => k.includes('SUPABASE'));
  
  return NextResponse.json({
    supabaseSecretKey: {
      hasKey: !!secretKey,
      keyLength: secretKey?.length || 0,
      keyPreview: secretKey ? secretKey.substring(0, 15) + '...' : 'MISSING',
      status: secretKey ? '✅ FOUND' : '❌ MISSING'
    },
    supabaseServiceRoleKey: {
      hasKey: !!serviceRoleKey,
      keyLength: serviceRoleKey?.length || 0,
      keyPreview: serviceRoleKey ? serviceRoleKey.substring(0, 15) + '...' : 'MISSING',
      status: serviceRoleKey ? '✅ FOUND' : '❌ MISSING'
    },
    supabaseKeyAlt: {
      hasKey: !!altKey,
      keyLength: altKey?.length || 0,
      keyPreview: altKey ? altKey.substring(0, 15) + '...' : 'MISSING',
      status: altKey ? '✅ FOUND' : '❌ MISSING'
    },
    finalKey: secretKey || serviceRoleKey || altKey ? 'Available ✅' : 'MISSING ❌',
    allSupabaseKeys: supabaseKeys,
    timestamp: new Date().toISOString(),
    note: 'Checking SUPABASE_SECRET_KEY (new workaround)'
  });
}

