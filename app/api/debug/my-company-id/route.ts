/**
 * Debug endpoint to show user their actual company ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are not available in production' },
      { status: 404 }
    );
  }
  const headersList = await headers();
  
  // Get ALL possible company IDs from ALL sources
  const sources = {
    urlParam: new URL(request.url).searchParams.get('companyId'),
    header_xwhop: headersList.get('x-whop-company-id'),
    header_whop: headersList.get('whop-company-id'),
    header_company: headersList.get('company-id'),
    referer: headersList.get('referer'),
    allHeaders: Object.fromEntries(headersList.entries()),
  };
  
  // Try to verify with Whop SDK
  let whopUserId = null;
  try {
    const { whopSdk } = await import('@/lib/whop-sdk');
    const tokenResult = await whopSdk.verifyUserToken(headersList);
    whopUserId = tokenResult?.userId;
  } catch (e) {
    // ignore
  }
  
  return NextResponse.json({
    message: "Here's ALL the info we can see",
    companyIdSources: sources,
    whopUserId,
    instructions: {
      step1: "Your company ID is one of the values above (starts with biz_)",
      step2: `Access the app with: https://your-app.vercel.app/analytics?companyId=biz_YOUR_ID`,
      step3: "OR configure Whop app settings to include companyId in URL"
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

