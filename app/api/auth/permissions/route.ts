import { NextRequest, NextResponse } from 'next/server';
import { authenticateWhopUser, requireAuth } from '@/lib/auth/whop-auth';

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
      const experienceToCompanyMap: Record<string, string> = {
        // Experience mappings added dynamically in production
      };
      
      actualCompanyId = experienceToCompanyMap[companyId] || companyId;
    } else if (!companyId.startsWith('biz_')) {
      // This is a company route - use the provided ID
      const routeToCompanyMap: Record<string, string> = {
        // Route mappings added dynamically in production
      };
      
      actualCompanyId = routeToCompanyMap[companyId] || companyId;
    } else {
    }
    
    // Create a new request with the correct company ID
    const modifiedUrl = new URL(request.url);
    modifiedUrl.searchParams.set('companyId', actualCompanyId);
    const modifiedRequest = new Request(modifiedUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Use proper Whop authentication
    // In development, allow fallback if headers aren't present
    let auth;
    try {
      auth = await authenticateWhopUser(modifiedRequest);
    } catch (authError: any) {
      // In development only: Allow fallback for testing
      if (process.env.NODE_ENV === 'development' && authError.message.includes('No user ID')) {
        console.warn('⚠️ [Permissions] Development mode: Using fallback auth');
        return NextResponse.json({
          success: true,
          isOwner: true,
          isStudent: false,
          isAdmin: true,
          accessLevel: 'owner',
          userId: 'dev_user',
          companyId: actualCompanyId,
          isTestMode: true,
          temporary: true,
          reason: 'development_fallback'
        });
      }
      throw authError;
    }
    
    const elapsed = Date.now() - startTime;

    // CRITICAL: Whop sends viewType="app" and /joined/ URL for BOTH students AND owners!
    // We MUST use Whop's server-side authentication (auth.isOwner) as the PRIMARY signal
    let isStudent = false;
    let isOwner = false;
    
    
    // PRIMARY: Use Whop's server-side authentication (MOST RELIABLE)
    if (auth.isOwner) {
      isOwner = true;
      isStudent = false;
    } 
    // SECONDARY: Check for explicit admin/analytics viewType
    else if (viewType === 'admin' || viewType === 'analytics') {
      isOwner = true;
      isStudent = false;
    } 
    // TERTIARY: Check for /dashboard/ URL pattern
    else if (baseHref?.includes('/dashboard/')) {
      isOwner = true;
      isStudent = false;
    } 
    // DEFAULT: If not owner, must be student
    else {
      isStudent = true;
      isOwner = false;
    }
    

    return NextResponse.json({
      success: true,
      isOwner: isOwner,
      isStudent: isStudent,
      isAdmin: auth.isAdmin,
      accessLevel: isOwner ? 'owner' : 'student',
      userId: auth.userId,
      companyId: auth.companyId,
      isTestMode: false, // Production auth - no test mode
    });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ [Permissions API GET] Failed in ${elapsed}ms:`, error);
    
    // SECURITY: Fail-closed - deny access on error
    // In development only: Allow fallback for testing
    if (process.env.NODE_ENV === 'development' && error.message.includes('No user ID')) {
      console.warn('⚠️ [Permissions GET] Development mode: Using fallback auth');
      return NextResponse.json({
        success: true,
        isOwner: true,
        isStudent: false,
        isAdmin: true,
        accessLevel: 'owner',
        userId: 'dev_user',
        companyId: actualCompanyId || '',
        isTestMode: true,
        temporary: true,
        reason: 'development_fallback'
      });
    }
    
    // PRODUCTION: Deny access on error
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check permissions',
      isOwner: false,
      isStudent: false,
      isAdmin: false,
      accessLevel: 'none',
      userId: null,
      companyId: null,
    }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    
    // Create a request URL with companyId
    const requestUrl = new URL(request.url);
    requestUrl.searchParams.set('companyId', companyId);
    const modifiedRequest = new Request(requestUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Use proper Whop authentication
    // In development, allow fallback if headers aren't present
    let auth;
    try {
      auth = await authenticateWhopUser(modifiedRequest);
    } catch (authError: any) {
      // In development only: Allow fallback for testing
      if (process.env.NODE_ENV === 'development' && authError.message.includes('No user ID')) {
        console.warn('⚠️ [Permissions POST] Development mode: Using fallback auth');
        return NextResponse.json({
          success: true,
          permissions: {
            userId: 'dev_user',
            isAuthorized: true,
            userRole: 'owner',
            canViewAnalytics: true,
            canManageData: true,
            canSyncStudents: true,
            canAccessSettings: true,
            isTestMode: true
          },
          message: 'Development mode: Access granted for testing',
          temporary: true
        });
      }
      throw authError;
    }
    
    // AUTO-SYNC: Fetch latest subscription from Whop on EVERY login
    // Creates DB record if missing, updates if exists
    if (companyId && auth.isAuthenticated) {
      try {
        console.log(`🔄 [Auth] Auto-syncing subscription for ${companyId}...`);
        
        // ALWAYS sync - this will create OR update records automatically
        const syncResponse = await fetch(`${request.headers.get('origin') || 'http://localhost:3000'}/api/admin/force-sync-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId }),
        });
        
        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log(`✅ [Auth] Auto-sync complete: tier=${syncData.data?.tier || 'none'}, status=${syncData.data?.status || 'none'}`);
        } else {
          console.log(`⚠️  [Auth] Auto-sync failed: ${syncResponse.status}`);
        }
      } catch (syncError: any) {
        console.error(`❌ [Auth] Auto-sync error:`, syncError.message);
        // Don't block auth if sync fails
      }
    }
    
    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      permissions: {
        userId: auth.userId,
        isAuthorized: true,
        userRole: auth.accessLevel,
        canViewAnalytics: auth.isOwner || auth.isAdmin,
        canManageData: auth.isOwner || auth.isAdmin,
        canSyncStudents: auth.isOwner || auth.isAdmin,
        canAccessSettings: auth.isOwner || auth.isAdmin,
        isTestMode: false // Production auth - no test mode
      },
      message: 'User is authorized to access analytics'
    });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ [Permissions API POST] Failed in ${elapsed}ms:`, error);
    
    // SECURITY: Fail-closed - deny access on error
    return NextResponse.json({
      success: false,
      error: 'Authentication failed',
      message: error.message || 'Unable to authenticate user',
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
