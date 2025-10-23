/**
 * Debug endpoint to check OpenAI API key configuration
 * Visit: /api/debug/check-openai-key
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  
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
  });
}

