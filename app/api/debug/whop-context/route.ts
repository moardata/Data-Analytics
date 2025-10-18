import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const url = new URL(request.url);
    
    // Get all headers
    const allHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      allHeaders[key] = value;
    });
    
    // Extract relevant information
    const context = {
      url: {
        href: url.href,
        pathname: url.pathname,
        search: url.search,
        searchParams: Object.fromEntries(url.searchParams.entries())
      },
      headers: {
        referer: headersList.get('referer'),
        origin: headersList.get('origin'),
        host: headersList.get('host'),
        userAgent: headersList.get('user-agent'),
        // Whop-specific headers
        whopCompanyId: headersList.get('x-whop-company-id') || headersList.get('whop-company-id') || headersList.get('company-id'),
        whopUserId: headersList.get('x-whop-user-id') || headersList.get('whop-user-id') || headersList.get('user-id'),
        authorization: headersList.get('authorization') ? 'Present' : 'Missing',
        // All headers for debugging
        allHeaders
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        whopAppId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
        whopCompanyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID
      }
    };
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      context
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
