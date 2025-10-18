import { NextResponse } from 'next/server';

export async function GET() {
  // Direct check - no imports, no dependencies
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  return NextResponse.json({
    hasKey: !!key,
    keyLength: key?.length || 0,
    keyPreview: key ? key.substring(0, 15) + '...' : 'MISSING',
    allEnv: Object.keys(process.env),
    timestamp: new Date().toISOString(),
  });
}

