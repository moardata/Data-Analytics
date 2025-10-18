import { NextResponse } from 'next/server';

export async function GET() {
  // Direct check - no imports, no dependencies
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const altKey = process.env.SUPABASE_KEY;
  
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
    allEnv: Object.keys(process.env),
    timestamp: new Date().toISOString(),
    note: 'If SUPABASE_SERVICE_ROLE_KEY doesnt work, add SUPABASE_KEY to Vercel instead'
  });
}

