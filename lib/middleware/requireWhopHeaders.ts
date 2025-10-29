/**
 * Middleware to block direct access (non-Whop access)
 * Forces users to access app through Whop platform only
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function requireWhopHeaders(request: NextRequest): Promise<NextResponse | null> {
  // Allow in development/test mode
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  // Allow debug endpoints
  if (request.nextUrl.pathname.startsWith('/api/debug')) {
    return null;
  }

  try {
    const headersList = await headers();
    
    // Check for ANY Whop header
    const hasWhopHeaders = 
      headersList.get('authorization') ||
      headersList.get('x-whop-user-id') ||
      headersList.get('x-whop-company-id') ||
      headersList.get('x-whop-access-token');

    if (!hasWhopHeaders) {
      
      return NextResponse.json({
        error: 'Direct Access Not Allowed',
        message: 'This app must be accessed through the Whop platform.',
        instructions: 'Please access this app from your Whop dashboard.',
        whopUrl: 'https://whop.com',
      }, { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    return null; // Allow access

  } catch (error) {
    console.error('❌ [requireWhopHeaders] Error checking headers:', error);
    return NextResponse.json({
      error: 'Authentication Error',
      message: 'Unable to verify Whop authentication',
    }, { status: 500 });
  }
}

