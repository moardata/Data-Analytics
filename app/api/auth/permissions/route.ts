import { NextRequest, NextResponse } from 'next/server';
import { simpleAuth } from '@/lib/auth/simple-auth';

/**
 * Permissions API Endpoint
 * Fast authentication with no hanging
 * Works in testing AND production
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    console.log('🔐 [Permissions API GET] Checking ownership for company:', companyId);
    
    // Map company route to actual company ID
    let actualCompanyId = companyId;
    if (companyId === 'live-analytics') {
      actualCompanyId = 'biz_3GYHNPbGkZCEky'; // Your company ID
    }
    
    console.log('🔐 [Permissions API GET] Mapped to actual company ID:', actualCompanyId);
    
    // Create a new request with the correct company ID
    const modifiedUrl = new URL(request.url);
    modifiedUrl.searchParams.set('companyId', actualCompanyId);
    const modifiedRequest = new Request(modifiedUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Use simple auth (never hangs, max 1s timeout)
    const auth = await simpleAuth(modifiedRequest);
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ [Permissions API GET] Complete in ${elapsed}ms - Owner: ${auth.isOwner}`);

    return NextResponse.json({
      success: true,
      isOwner: auth.isOwner,
      isAdmin: auth.isAdmin,
      accessLevel: auth.accessLevel,
      userId: auth.userId,
      companyId: auth.companyId,
      isTestMode: auth.isTestMode,
    });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ [Permissions API GET] Failed in ${elapsed}ms:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check permissions',
      isOwner: false,
      accessLevel: 'none',
    }, { status: 500 });
  }
}

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
    
    // SECURITY: Fail-closed in production (deny access on error)
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('⚠️ [Permissions API] Development mode - granting test access despite error');
      return NextResponse.json({
        success: true,
        permissions: {
          userId: 'test_user',
          isAuthorized: true,
          userRole: 'owner',
          canViewAnalytics: true,
          canManageData: true,
          canSyncStudents: true,
          canAccessSettings: true,
          isTestMode: true
        },
        message: 'Development mode: Access granted for testing'
      });
    } else {
      // PRODUCTION: Deny access on authentication failure
      console.log('🔒 [Permissions API] Production mode - denying access due to auth error');
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        permissions: {
          userId: null,
          isAuthorized: false,
          userRole: 'none',
          canViewAnalytics: false,
          canManageData: false,
          canSyncStudents: false,
          canAccessSettings: false,
          isTestMode: false
        }
      }, { status: 401 });
    }
  }
}
