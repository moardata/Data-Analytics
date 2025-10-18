import { NextResponse } from 'next/server';

export async function GET() {
  // Direct check - no imports, no dependencies
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const altKey = process.env.SUPABASE_KEY;
  
  // Find ANY env var with SERVICE_ROLE in the name
  const allEnvKeys = Object.keys(process.env);
  const serviceRoleKeys = allEnvKeys.filter(k => k.includes('SERVICE_ROLE'));
  const supabaseKeys = allEnvKeys.filter(k => k.includes('SUPABASE'));
  
  // Get values for any SERVICE_ROLE keys found
  const serviceRoleValues = serviceRoleKeys.map(k => ({
    name: k,
    hasValue: !!process.env[k],
    length: process.env[k]?.length || 0,
    preview: process.env[k] ? process.env[k]!.substring(0, 15) + '...' : 'empty'
  }));
  
  return NextResponse.json({
    supabaseServiceRoleKey: {
      hasKey: !!key,
      keyLength: key?.length || 0,
      keyPreview: key ? key.substring(0, 15) + '...' : 'MISSING',
    },
    supabaseKeyAlt: {
      hasKey: !!altKey,
      keyLength: altKey?.length || 0,
      keyPreview: altKey ? altKey.substring(0, 15) + '...' : 'MISSING',
    },
    searchResults: {
      keysWithSERVICE_ROLE: serviceRoleKeys,
      keysWithSUPABASE: supabaseKeys,
      serviceRoleDetails: serviceRoleValues,
    },
    allEnv: allEnvKeys,
    timestamp: new Date().toISOString(),
    note: 'Searching for any key containing SERVICE_ROLE'
  });
}

