/**
 * Debug endpoint to check OpenAI API key configuration
 * Visit: /api/debug/check-openai-key
 */

import { NextResponse } from 'next/server';

// Force Node.js runtime to ensure env vars work properly
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  
  // Also log to console to compare with instrumentation
  console.log('🔍 [Debug Endpoint] OPENAI_API_KEY exists:', !!key);
  console.log('🔍 [Debug Endpoint] OPENAI_API_KEY ending:', key ? '...' + key.substring(key.length - 10) : 'NO KEY');
  console.log('🔍 [Debug Endpoint] All env vars with OPENAI:', Object.keys(process.env).filter(k => k.includes('OPENAI')));
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasKey: !!key,
    keyLength: key?.length || 0,
    keyPrefix: key ? key.substring(0, 10) : 'NO KEY',
    keySuffix: key ? '...' + key.substring(key.length - 10) : 'NO KEY',
    expectedSuffix: '...O1oHb2bKkA',
    isCorrectKey: key ? key.endsWith('O1oHb2bKkA') : false,
    isOldKey: key ? key.endsWith('uJ8A') : false,
    fullKey: key, // TEMPORARY: Show full key for debugging
  });
}

