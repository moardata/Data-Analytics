/**
 * Whop Authentication Utilities
 * Validates Whop authorization headers and extracts user/company info
 */

import { headers } from 'next/headers';

export interface WhopAuthResult {
  userId: string;
  companyId: string;
  isAuthenticated: boolean;
}

/**
 * Gets Whop authentication from headers
 * Whop passes user context via headers when app is embedded
 */
export async function getWhopAuth(): Promise<WhopAuthResult | null> {
  const headersList = await headers();
  
  // Whop passes these headers in the iframe context
  const userId = headersList.get('x-whop-user-id');
  const companyId = headersList.get('x-whop-company-id');
  
  // Also check for authorization header
  const authorization = headersList.get('authorization');
  
  if (!userId && !companyId && !authorization) {
    return null;
  }

  // If we have user/company from headers, use those
  if (userId && companyId) {
    return {
      userId,
      companyId,
      isAuthenticated: true,
    };
  }

  // For development/testing: allow fallback from query params
  // In production, remove this and only use Whop headers
  if (process.env.NODE_ENV === 'development') {
    return {
      userId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID || 'user_dev',
      companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 'biz_dev',
      isAuthenticated: true,
    };
  }

  return null;
}

/**
 * Validates that the request has proper Whop authentication
 * Returns the companyId if valid, throws error if not
 */
export async function requireWhopAuth(): Promise<string> {
  const auth = await getWhopAuth();
  
  if (!auth || !auth.isAuthenticated) {
    throw new Error('Unauthorized: No valid Whop authentication');
  }
  
  return auth.companyId;
}

/**
 * Gets companyId from request, with fallback for testing
 */
export async function getCompanyId(request: Request): Promise<string | null> {
  const auth = await getWhopAuth();
  
  if (auth?.companyId) {
    return auth.companyId;
  }
  
  // Development fallback: check URL params
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    if (clientId) {
      return clientId;
    }
  }
  
  return null;
}


