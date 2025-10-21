import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * Simple API to check if the current user owns the company
 * Uses Whop headers sent by the Whop platform
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ 
        isOwner: false,
        error: 'No company ID provided'
      });
    }

    const headersList = await headers();
    
    // Log ALL headers for debugging
    const allHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      allHeaders[key] = value;
    });
    console.log('🔐 [Check Owner] ALL Headers:', allHeaders);
    
    const whopUserId = headersList.get('x-whop-user-id');
    const whopCompanyId = headersList.get('x-whop-company-id');
    const whopAccessToken = headersList.get('x-whop-access-token');
    
    console.log('🔐 [Check Owner] Whop Headers:', {
      userId: whopUserId,
      companyId: whopCompanyId,
      hasAccessToken: !!whopAccessToken,
      requestedCompany: companyId,
    });

    // CRITICAL: If no Whop headers, everyone is a student (fail-closed)
    if (!whopUserId) {
      console.log('⚠️ [Check Owner] NO WHOP HEADERS - User is student');
      return NextResponse.json({ 
        isOwner: false,
        reason: 'No Whop user ID in headers',
        userId: null,
        companyId: null,
      });
    }

    // Check if user owns this company
    const isOwner = whopCompanyId === companyId || 
                   process.env.NEXT_PUBLIC_WHOP_COMPANY_ID === companyId;

    console.log('🔍 [Check Owner] Ownership check:', { 
      whopCompanyId,
      requestedCompanyId: companyId,
      matches: whopCompanyId === companyId,
      isOwner 
    });

    return NextResponse.json({ 
      isOwner,
      userId: whopUserId,
      companyId: whopCompanyId,
    });

  } catch (error: any) {
    console.error('❌ [Check Owner] Error:', error);
    return NextResponse.json({ 
      isOwner: false,
      error: error.message 
    });
  }
}

