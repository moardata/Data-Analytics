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
 * Gets companyId from Whop authentication context
 * In Whop apps, the companyId is determined by which company the user is accessing the app from
 */
export async function getCompanyId(request: Request): Promise<string | null> {
  try {
    const url = new URL(request.url);
    
    // First, try to get companyId from URL params (for testing)
    const urlCompanyId = url.searchParams.get('companyId');
    if (urlCompanyId) {
      console.log('Using companyId from URL params:', urlCompanyId);
      return urlCompanyId;
    }
    
    // For production, we need to get the companyId from Whop's authentication context
    const headersList = await headers();
    
    // Check for companyId in headers (Whop may pass this)
    const headerCompanyId = headersList.get('x-whop-company-id') || 
                           headersList.get('whop-company-id') ||
                           headersList.get('company-id');
    
    if (headerCompanyId) {
      console.log('Using companyId from headers:', headerCompanyId);
      return headerCompanyId;
    }
    
    // Check for companyId in the referer URL (Whop embeds apps with company context)
    const referer = headersList.get('referer');
    if (referer) {
      const refererUrl = new URL(referer);
      const refererCompanyId = refererUrl.searchParams.get('companyId') || 
                              refererUrl.pathname.match(/\/company\/([^\/]+)/)?.[1];
      
      if (refererCompanyId) {
        console.log('Using companyId from referer:', refererCompanyId);
        return refererCompanyId;
      }
    }
    
    // Note: We cannot get companyId from Whop SDK user context alone
    // The SDK doesn't provide a method to list user's companies
    // We rely on URL parameters, headers, or referer URL instead
    
    // Fallback to environment variable for testing (but this should be different per group)
    const envCompanyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    if (envCompanyId) {
      console.log('⚠️ Using companyId from environment (fallback):', envCompanyId);
      return envCompanyId;
    }
    
    console.log('No companyId found in any source');
    return null;
  } catch (error) {
    console.error('Error getting companyId:', error);
    return null;
  }
}


