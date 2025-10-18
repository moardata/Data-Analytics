import { NextRequest, NextResponse } from 'next/server';
import { simpleAuth } from '@/lib/auth/simple-auth';

/**
 * Permissions API Endpoint
 * Fast authentication with no hanging
 * Works in testing AND production
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🔐 [Permissions API] Request received');
    
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    console.log('🔐 [Permissions API] Authenticating for company:', companyId);
    
    // Create a mock request with the companyId
    const mockUrl = `https://app.com?companyId=${companyId}`;
    const mockRequest = new Request(mockUrl, {
      headers: request.headers
    });
    
    // Use simple auth (never hangs, max 1s timeout)
    const auth = await simpleAuth(mockRequest);
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ [Permissions API] Complete in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      permissions: {
        userId: auth.userId,
        isAuthorized: true,
        userRole: auth.accessLevel,
        canViewAnalytics: true,
        canManageData: true,
        canSyncStudents: true,
        canAccessSettings: true,
        isTestMode: auth.isTestMode
      },
      message: auth.isTestMode 
        ? 'Test mode: Access granted for testing' 
        : 'User is authorized to access analytics'
    });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ [Permissions API] Failed in ${elapsed}ms:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check permissions',
      permissions: {
        userId: undefined,
        isAuthorized: false,
        userRole: 'unknown',
        canViewAnalytics: false,
        canManageData: false,
        canSyncStudents: false,
        canAccessSettings: false
      }
    }, { status: 500 });
  }
}
