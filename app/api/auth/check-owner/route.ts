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
    const whopUserId = headersList.get('x-whop-user-id');
    const whopCompanyId = headersList.get('x-whop-company-id');
    
    console.log('🔐 [Check Owner] Headers:', {
      userId: whopUserId,
      companyId: whopCompanyId,
      requestedCompany: companyId,
    });

    // Check if user owns this company
    // For now, if there's a whop user ID and company ID matches, they're the owner
    const isOwner = !!whopUserId && (whopCompanyId === companyId || 
                                     process.env.NEXT_PUBLIC_WHOP_COMPANY_ID === companyId);

    console.log('🔍 [Check Owner] Result:', { isOwner });

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

