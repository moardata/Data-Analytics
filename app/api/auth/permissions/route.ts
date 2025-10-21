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
    const viewType = searchParams.get('viewType');
    const baseHref = searchParams.get('baseHref');

    console.log('🔐 [Permissions API GET] Whop Forms app pattern:');
    console.log('🔐 [Permissions API GET] Company ID:', companyId);
    console.log('🔐 [Permissions API GET] ViewType:', viewType);
    console.log('🔐 [Permissions API GET] BaseHref:', baseHref);

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }
    
    // Handle different types of company identifiers
    let actualCompanyId = companyId;
    
    if (companyId.startsWith('exp_')) {
      // This is an experience ID - we need to get the company ID from the experience
      // For now, we'll use a mapping approach
      const experienceToCompanyMap: Record<string, string> = {
        'exp_2BXhmdlqcnLGc5': 'biz_3GYHNPbGkZCEky', // Your experience -> your company
        // Add more experience mappings as needed
      };
      
      actualCompanyId = experienceToCompanyMap[companyId] || 'biz_3GYHNPbGkZCEky'; // Default fallback
      console.log('🔐 [Permissions API GET] Mapped experience to company ID:', companyId, '->', actualCompanyId);
    } else if (!companyId.startsWith('biz_')) {
      // This is a company route (like "live-analytics"), we need to get the real company ID
      const routeToCompanyMap: Record<string, string> = {
        'live-analytics': 'biz_3GYHNPbGkZCEky',
        'creator-analytics': 'biz_3GYHNPbGkZCEky',
        'data-analytics': 'biz_3GYHNPbGkZCEky',
        // Add more mappings as needed
      };
      
      actualCompanyId = routeToCompanyMap[companyId] || 'biz_3GYHNPbGkZCEky'; // Default fallback
      console.log('🔐 [Permissions API GET] Mapped route to company ID:', companyId, '->', actualCompanyId);
    } else {
      console.log('🔐 [Permissions API GET] Using direct company ID:', actualCompanyId);
    }
    
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

    // CRITICAL: Whop sends viewType="app" and /joined/ URL for BOTH students AND owners!
    // We MUST use Whop's server-side authentication (auth.isOwner) as the PRIMARY signal
    let isStudent = false;
    let isOwner = false;
    
    console.log('🔍 [Permissions API GET] Detection signals:');
    console.log('  - viewType:', viewType);
    console.log('  - baseHref:', baseHref);
    console.log('  - baseHref includes /joined/:', baseHref?.includes('/joined/'));
    console.log('  - baseHref includes /dashboard/:', baseHref?.includes('/dashboard/'));
    console.log('  - auth.isOwner from Whop API:', auth.isOwner);
    console.log('  - auth.userId:', auth.userId);
    
    // PRIMARY: Use Whop's server-side authentication (MOST RELIABLE)
    if (auth.isOwner) {
      isOwner = true;
      isStudent = false;
      console.log('👑 [Permissions API GET] ✅ OWNER detected via Whop API authentication');
    } 
    // SECONDARY: Check for explicit admin/analytics viewType
    else if (viewType === 'admin' || viewType === 'analytics') {
      isOwner = true;
      isStudent = false;
      console.log('👑 [Permissions API GET] ✅ OWNER detected via viewType:', viewType);
    } 
    // TERTIARY: Check for /dashboard/ URL pattern
    else if (baseHref?.includes('/dashboard/')) {
      isOwner = true;
      isStudent = false;
      console.log('👑 [Permissions API GET] ✅ OWNER detected via /dashboard/ URL');
    } 
    // DEFAULT: If not owner, must be student
    else {
      isStudent = true;
      isOwner = false;
      console.log('🎓 [Permissions API GET] ✅ STUDENT (not owner per Whop API)');
    }
    
    console.log('🔍 [Permissions API GET] FINAL RESULT:', { isStudent, isOwner });

    return NextResponse.json({
      success: true,
      isOwner: isOwner,
      isStudent: isStudent,
      isAdmin: auth.isAdmin,
      accessLevel: isOwner ? 'owner' : 'student',
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
