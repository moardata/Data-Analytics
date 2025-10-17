import { NextResponse } from 'next/server';

export async function GET() {
  const hasSecret = !!process.env.WHOP_WEBHOOK_SECRET;
  const bypassMode = !hasSecret || process.env.BYPASS_WEBHOOK_VALIDATION === 'true';
  
  return NextResponse.json({
    version: 'v6-cleaned',
    timestamp: new Date().toISOString(),
    webhookConfig: {
      hasSecret,
      bypassMode,
      reason: !hasSecret ? 'No secret configured' : bypassMode ? 'Bypass enabled' : 'Validation enabled'
    },
    message: 'Webhook validation cleaned up and simplified'
  });
}

