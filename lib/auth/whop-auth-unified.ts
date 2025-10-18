/**
 * Unified Whop Authentication System
 * Uses @whop/api v0.0.50+ SDK properly with App/Company/Me modes
 * 
 * This is the SINGLE SOURCE OF TRUTH for Whop authentication
 * Based on latest Whop SDK patterns (October 2025)
 */

import { headers } from 'next/headers';
import { whopSdk } from '@/lib/whop-sdk';

export interface WhopAuthResult {
  userId: string;
  companyId: string;
  isAuthenticated: boolean;
  hasCompanyAccess: boolean;
  accessLevel: 'owner' | 'admin' | 'member' | 'none';
  isAdmin: boolean;
  isOwner: boolean;
}

export interface WhopRequestContext {
  request?: Request;
  companyId?: string;
  userId?: string;
}

/**
 * Main authentication function - validates user and checks company access
 * This uses the proper @whop/api SDK methods
 */
export async function authenticateWhopUser(context?: WhopRequestContext): Promise<WhopAuthResult> {
  try {
    // Step 1: Get headers
    const headersList = context?.request ? context.request.headers : await headers();
    
    // Step 2: Validate user token using SDK
    const tokenResult = await whopSdk.verifyUserToken(headersList);
    const userId = tokenResult.userId;
    
    if (!userId) {
      throw new Error('No valid user token found');
    }

    console.log('✅ User authenticated:', userId);

    // Step 3: Get company ID from multiple sources
    let companyId = context?.companyId;
    
    if (!companyId && context?.request) {
      const url = new URL(context.request.url);
      companyId = url.searchParams.get('companyId') || url.searchParams.get('company_id') || undefined;
    }
    
    if (!companyId) {
      // Try headers
      companyId = headersList.get('x-whop-company-id') || 
                  headersList.get('whop-company-id') ||
                  headersList.get('company-id') || 
                  undefined;
    }

    if (!companyId) {
      // Fallback for development
      companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    }

    if (!companyId) {
      throw new Error('No company ID found in request');
    }

    console.log('✅ Company ID detected:', companyId);

    // Step 4: Check if user has access to this company
    const accessCheck = await whopSdk.access.checkIfUserHasAccessToCompany({
      userId,
      companyId,
    });

    if (!accessCheck.hasAccess) {
      console.warn('❌ User does not have access to company:', { userId, companyId });
      return {
        userId,
        companyId,
        isAuthenticated: true,
        hasCompanyAccess: false,
        accessLevel: 'none',
        isAdmin: false,
        isOwner: false,
      };
    }

    // Step 5: Determine access level
    const accessLevel = (accessCheck.accessLevel?.toString().toLowerCase() || 'member') as any;
    const isOwner = accessLevel === 'owner' || accessLevel === 'creator';
    const isAdmin = isOwner || accessLevel === 'admin' || accessLevel === 'administrator';

    console.log('✅ Access verified:', { userId, companyId, accessLevel, isAdmin });

    return {
      userId,
      companyId,
      isAuthenticated: true,
      hasCompanyAccess: true,
      accessLevel: isOwner ? 'owner' : isAdmin ? 'admin' : 'member',
      isAdmin,
      isOwner,
    };

  } catch (error) {
    console.error('❌ Whop authentication failed:', error);
    
    // DEVELOPMENT ONLY: Bypass for local testing
    if (process.env.BYPASS_WHOP_AUTH === 'true' && process.env.NODE_ENV === 'development') {
      console.warn('⚠️  BYPASS MODE ACTIVE - THIS SHOULD NEVER BE IN PRODUCTION!');
      const fallbackCompanyId = context?.companyId || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 'biz_test';
      return {
        userId: 'dev_user',
        companyId: fallbackCompanyId,
        isAuthenticated: true,
        hasCompanyAccess: true,
        accessLevel: 'owner',
        isAdmin: true,
        isOwner: true,
      };
    }
    
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(context?: WhopRequestContext): Promise<WhopAuthResult> {
  const result = await authenticateWhopUser(context);
  
  if (!result.isAuthenticated) {
    throw new Error('Authentication required');
  }
  
  return result;
}

/**
 * Require company access - throws if user doesn't have access
 */
export async function requireCompanyAccess(context?: WhopRequestContext): Promise<WhopAuthResult> {
  const result = await requireAuth(context);
  
  if (!result.hasCompanyAccess) {
    throw new Error('Access denied: You do not have access to this company');
  }
  
  return result;
}

/**
 * Require admin or owner access - throws if user is not admin/owner
 */
export async function requireAdminAccess(context?: WhopRequestContext): Promise<WhopAuthResult> {
  const result = await requireCompanyAccess(context);
  
  if (!result.isAdmin && !result.isOwner) {
    throw new Error('Access denied: Admin or owner access required');
  }
  
  return result;
}

/**
 * Get company ID from request - simplified helper
 */
export async function getCompanyIdFromRequest(request: Request): Promise<string | null> {
  try {
    // Try URL params first
    const url = new URL(request.url);
    let companyId = url.searchParams.get('companyId') || url.searchParams.get('company_id');
    
    if (companyId) return companyId;
    
    // Try headers
    const headersList = request.headers;
    companyId = headersList.get('x-whop-company-id') || 
                headersList.get('whop-company-id') ||
                headersList.get('company-id');
    
    if (companyId) return companyId;
    
    // Try referer
    const referer = headersList.get('referer');
    if (referer) {
      const refererUrl = new URL(referer);
      companyId = refererUrl.searchParams.get('companyId') || refererUrl.searchParams.get('company_id');
      if (companyId) return companyId;
    }
    
    // Fallback
    return process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || null;
    
  } catch (error) {
    console.error('Error getting company ID:', error);
    return null;
  }
}

/**
 * Check if user has specific permission for an action
 */
export async function checkPermission(
  action: 'viewAnalytics' | 'manageData' | 'syncStudents' | 'accessSettings',
  context?: WhopRequestContext
): Promise<boolean> {
  try {
    const auth = await authenticateWhopUser(context);
    
    if (!auth.hasCompanyAccess) {
      return false;
    }
    
    // Admins and owners have all permissions
    if (auth.isAdmin || auth.isOwner) {
      return true;
    }
    
    // Members can only view analytics
    if (action === 'viewAnalytics' && auth.accessLevel === 'member') {
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

