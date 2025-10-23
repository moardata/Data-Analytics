/**
 * Check ALL possible sources of OPENAI_API_KEY
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Check ALL possible environment variable names/sources
  const allEnvKeys = Object.keys(process.env).filter(k => 
    k.toUpperCase().includes('OPENAI') || 
    k.toUpperCase().includes('API') ||
    k.toUpperCase().includes('KEY')
  );
  
  const checks = {
    'process.env.OPENAI_API_KEY': process.env.OPENAI_API_KEY,
    'process.env.NEXT_PUBLIC_OPENAI_API_KEY': (process.env as any).NEXT_PUBLIC_OPENAI_API_KEY,
    'process.env.OPENAI_KEY': (process.env as any).OPENAI_KEY,
    'process.env.OPEN_AI_API_KEY': (process.env as any).OPEN_AI_API_KEY,
  };
  
  const results: any = {};
  
  for (const [name, value] of Object.entries(checks)) {
    if (value) {
      const val = value as string;
      results[name] = {
        exists: true,
        length: val.length,
        prefix: val.substring(0, 15),
        suffix: '...' + val.substring(val.length - 10),
        isOldKey: val.endsWith('2-FavyuJ8A') || val.endsWith('vyu8A') || val.endsWith('uJ8A'),
        isNewKey: val.endsWith('O1oHb2bKkA') || val.endsWith('b2bKkA') || val.endsWith('bKkA')
      };
    } else {
      results[name] = { exists: false };
    }
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    runtime: 'nodejs',
    allOpenAIKeys: allEnvKeys,
    checks: results,
    totalEnvVars: Object.keys(process.env).length
  });
}

