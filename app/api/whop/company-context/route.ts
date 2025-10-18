import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * This endpoint helps determine the company context for Whop apps
 * It should be called from the frontend to get the current company context
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const headersList = await headers();
    
    // Method 1: Get from URL parameters (most reliable for Whop)
    const urlCompanyId = url.searchParams.get('companyId');
    
    // Method 2: Get from referer URL (Whop embeds apps with company context)
    let refererCompanyId = null;
    const referer = headersList.get('referer');
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        refererCompanyId = refererUrl.searchParams.get('companyId') || 
                          refererUrl.pathname.match(/\/company\/([^\/]+)/)?.[1];
      } catch (e) {
        // Ignore referer parsing errors
      }
    }
    
    // Method 3: Get from headers (if Whop passes them)
    const headerCompanyId = headersList.get('x-whop-company-id') || 
                           headersList.get('whop-company-id') ||
                           headersList.get('company-id');
    
    // Method 4: Try to get from Whop SDK
    let sdkCompanyId = null;
    try {
      const { whopSdk } = await import('@/lib/whop-sdk');
      const authResult = await whopSdk.verifyUserToken(headersList);
      
      if (authResult.userId) {
        const userCompanies = await whopSdk.access.getUserCompanies({ userId: authResult.userId });
        if (userCompanies && userCompanies.length > 0) {
          // Use the first company as fallback
          sdkCompanyId = userCompanies[0].id;
        }
      }
    } catch (sdkError) {
      // Ignore SDK errors
    }
    
    // Determine the best company ID to use
    const companyId = urlCompanyId || refererCompanyId || headerCompanyId || sdkCompanyId;
    
    return NextResponse.json({
      companyId,
      sources: {
        url: urlCompanyId,
        referer: refererCompanyId,
        headers: headerCompanyId,
        sdk: sdkCompanyId
      },
      referer: referer,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
