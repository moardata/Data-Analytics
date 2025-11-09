/**
 * Authentication Helper Functions
 * Common patterns for API route authentication
 */

import { NextRequest } from 'next/server';
import { authenticateWhopUser, requireOwnerAccess, WhopAuthResult } from './whop-auth';

/**
 * Authenticate request with development fallback
 * Returns auth result or throws error
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<WhopAuthResult> {
  try {
    return await authenticateWhopUser(request);
  } catch (error: any) {
    // In development only: Allow fallback for testing
    if (process.env.NODE_ENV === 'development' && error.message.includes('No user ID')) {
      const url = new URL(request.url);
      const companyId = url.searchParams.get('companyId') || 
                       url.searchParams.get('company_id') ||
                       process.env.NEXT_PUBLIC_WHOP_COMPANY_ID ||
                       'dev_company';
      
      console.warn('⚠️ [Auth Helper] Development mode: Using fallback auth');
      return {
        userId: 'dev_user',
        companyId,
        isAuthenticated: true,
        accessLevel: 'owner',
        isOwner: true,
        isAdmin: true,
        isMember: false,
      };
    }
    throw error;
  }
}

/**
 * Require owner/admin access
 * Throws if not owner/admin
 */
export async function requireOwner(request: NextRequest): Promise<WhopAuthResult> {
  try {
    return await requireOwnerAccess(request);
  } catch (error: any) {
    // In development only: Allow fallback
    if (process.env.NODE_ENV === 'development' && error.message.includes('No user ID')) {
      const url = new URL(request.url);
      const companyId = url.searchParams.get('companyId') || 
                       url.searchParams.get('company_id') ||
                       process.env.NEXT_PUBLIC_WHOP_COMPANY_ID ||
                       'dev_company';
      
      console.warn('⚠️ [Auth Helper] Development mode: Granting owner access');
      return {
        userId: 'dev_user',
        companyId,
        isAuthenticated: true,
        accessLevel: 'owner',
        isOwner: true,
        isAdmin: true,
        isMember: false,
      };
    }
    throw error;
  }
}

/**
 * Get company ID from request
 */
export function getCompanyId(request: NextRequest): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('companyId') || 
         url.searchParams.get('company_id') ||
         null;
}

