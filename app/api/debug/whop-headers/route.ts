/**
 * Debug endpoint to see what headers Whop is sending
 * This will help us understand why student detection isn't working
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // Get all headers
    const allHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      allHeaders[key] = value;
    });
    
    // Get specific Whop headers
    const whopHeaders = {
      authorization: headersList.get('authorization'),
      'x-whop-user-id': headersList.get('x-whop-user-id'),
      'x-whop-company-id': headersList.get('x-whop-company-id'),
      'x-whop-membership-id': headersList.get('x-whop-membership-id'),
      'x-whop-access-token': headersList.get('x-whop-access-token'),
    };
    
    // Get URL params
    const { searchParams } = new URL(request.url);
    const companyIdFromUrl = searchParams.get('companyId');
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      whopHeaders,
      allHeaders,
      urlParams: {
        companyId: companyIdFromUrl,
      },
      message: 'Check if Whop is sending headers. If all headers are null, Whop might not be passing auth info.',
    });
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

