/**
 * Whop Authentication Utilities
 * Validates Whop authorization headers and extracts user/company info
 */

import { headers } from 'next/headers';

export interface WhopAuthResult {
  userId: string;
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

    return {
      userId,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error verifying Whop user token:', error);
    return null;
  }
}

/**
 * Validates that the request has proper Whop authentication
 * Returns the userId if valid, throws error if not
 */
export async function requireWhopAuth(): Promise<string> {
  const auth = await getWhopAuth();
  
  if (!auth || !auth.isAuthenticated) {
    throw new Error('Unauthorized: No valid Whop authentication');
  }
  
  return auth.userId;
}

/**
 * Gets companyId from request URL parameters
 * CompanyId is passed in via URL params when the Whop app is embedded
 */
export async function getCompanyId(request: Request): Promise<string | null> {
  try {
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    
    if (companyId) {
      console.log('Using companyId from URL params:', companyId);
      return companyId;
    }
    
    // Fallback to environment variable for testing
    const envCompanyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    if (envCompanyId) {
      console.log('Using companyId from environment:', envCompanyId);
      return envCompanyId;
    }
    
    console.log('No companyId found in URL params or environment');
    return null;
  } catch (error) {
    console.error('Error getting companyId:', error);
    return null;
  }
}


