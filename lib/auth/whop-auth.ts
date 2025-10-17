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
 * Gets Whop authentication using the SDK
 * Whop apps are embedded and use the SDK to verify user tokens
 */
export async function getWhopAuth(): Promise<WhopAuthResult | null> {
  try {
    const headersList = await headers();
    const { whopSdk } = await import('@/lib/whop-sdk');
    
    // Use Whop SDK to verify user token from headers
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    if (!userId) {
      console.log('No valid user token found in headers');
      return null;
    }

    // Get user info to extract company ID
    const user = await whopSdk.users.getUser({ userId });
    const companyId = user.company_id;

    if (!companyId) {
      console.log('User has no company ID');
      return null;
    }

    return {
      userId,
      companyId,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error verifying Whop user token:', error);
    return null;
  }
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
 * Gets companyId from request - PRODUCTION ONLY
 */
export async function getCompanyId(request: Request): Promise<string | null> {
  const auth = await getWhopAuth();
  
  if (auth?.companyId) {
    console.log('Using Whop auth companyId:', auth.companyId);
    return auth.companyId;
  }
  
  // PRODUCTION: No fallbacks - require proper Whop authentication
  console.log('No valid Whop authentication found');
  return null;
}


