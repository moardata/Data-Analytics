import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { whopSdk } from '@/lib/whop-sdk';

/**
 * Get Whop context information including company ID
 * This endpoint helps the frontend get the company context automatically
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // Get company ID from various sources
    let companyId: string | null = null;
    
    // 1. Try to get from URL parameters
    const { searchParams } = new URL(request.url);
    companyId = searchParams.get('companyId') || searchParams.get('company_id');
    
    // 2. Try to get from headers (Whop may pass this)
    if (!companyId) {
      companyId = headersList.get('x-whop-company-id') || 
                  headersList.get('whop-company-id') ||
                  headersList.get('company-id');
    }
    
    // 3. Try to get from referer URL
    if (!companyId) {
      const referer = headersList.get('referer');
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          companyId = refererUrl.searchParams.get('companyId') || 
                     refererUrl.searchParams.get('company_id') ||
                     refererUrl.pathname.match(/\/company\/([^\/]+)/)?.[1] ||
                     null;
        } catch (error) {
          console.log('Error parsing referer:', error);
        }
      }
    }
    
    // 4. Try to use Whop SDK to get current app context
    if (!companyId) {
      try {
        // This would require proper authentication, but let's try
        const appInfo = await whopSdk.app.get();
        if (appInfo && appInfo.company_id) {
          companyId = appInfo.company_id;
        }
      } catch (error) {
        console.log('Could not get app info from Whop SDK:', error);
      }
    }
    
    // 5. Fallback to environment variable for testing
    if (!companyId) {
      companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 'test_company';
    }
    
    return NextResponse.json({
      success: true,
      companyId,
      detected: companyId !== 'test_company',
      sources: {
        url: !!searchParams.get('companyId') || !!searchParams.get('company_id'),
        headers: !!(headersList.get('x-whop-company-id') || headersList.get('whop-company-id')),
        referer: !!referer,
        environment: companyId === process.env.NEXT_PUBLIC_WHOP_COMPANY_ID
      }
    });
    
  } catch (error: any) {
    console.error('Error getting Whop context:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 'test_company'
    }, { status: 500 });
  }
}
