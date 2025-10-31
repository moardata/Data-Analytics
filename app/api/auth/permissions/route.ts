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
    
    // Use simple auth (never hangs, max 1s timeout)
    const auth = await simpleAuth(modifiedRequest);
    
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
    
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    
    // Create a mock request with the companyId
    const mockUrl = `https://app.com?companyId=${companyId}`;
    const mockRequest = new Request(mockUrl, {
      headers: request.headers
    });
    
    // Use simple auth (never hangs, max 1s timeout)
    const auth = await simpleAuth(mockRequest);
    
    // AUTO-SYNC: Fetch latest subscription from Whop on every login
    // BUT: Skip if user already has an active trial (don't overwrite it!)
    if (companyId && !auth.isTestMode) {
      try {
        // First check if they have an active trial
        const { supabaseServer } = await import('@/lib/supabase-server');
        const { data: client } = await supabaseServer
          .from('clients')
          .select('trial_ends_at, subscription_status')
          .eq('company_id', companyId)
          .single();
        
        const hasActiveTrial = client?.trial_ends_at && new Date(client.trial_ends_at) > new Date();
        
        if (hasActiveTrial) {
          console.log(`⏭️ [Auth] Skipping auto-sync - user has active trial until ${client.trial_ends_at}`);
        } else {
          console.log(`🔄 [Auth] Auto-syncing subscription for ${companyId}...`);
          const syncResponse = await fetch(`${request.headers.get('origin') || 'https://app.com'}/api/admin/force-sync-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId }),
          });
          
          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            console.log(`✅ [Auth] Auto-sync complete: tier=${syncData.data?.tier || 'unknown'}`);
          } else {
            console.log(`⚠️  [Auth] Auto-sync failed: ${syncResponse.status}`);
          }
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
