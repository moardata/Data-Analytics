import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: 'v7-no-validation',
    timestamp: new Date().toISOString(),
    webhookConfig: {
      validationEnabled: false,
      note: 'All webhook validation is completely disabled for testing'
    },
    message: 'Webhook validation completely removed - ready for testing'
  });
}

