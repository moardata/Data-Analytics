import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: 'v5-force-bypass',
    timestamp: new Date().toISOString(),
    bypassEnabled: true,
    message: 'All webhook validation is currently bypassed for testing'
  });
}

