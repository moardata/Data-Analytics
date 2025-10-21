/**
 * Whop App Entry Point
 * Redirects based on user type: students to surveys, operators to analytics
 * Based on Whop Forms app pattern analysis
 */

import { redirect } from 'next/navigation';
import { detectUserType, getRedirectUrl } from '@/lib/auth/user-detection';
import { headers } from 'next/headers';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ 
    companyId?: string; 
    userId?: string; 
    userType?: string;
    viewType?: string;
    companyRoute?: string;
    experienceId?: string;
  }>;
}) {
  // In Next.js 15, searchParams is a Promise
  const params = await searchParams;
  
  // Get headers for Whop authentication
  const headersList = await headers();
  
  // Convert to URLSearchParams for detection
  const searchParamsObj = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParamsObj.set(key, value);
  });
  
  // Get current URL for pattern detection
  const url = headersList.get('referer') || '';
  
  // Detect user type with enhanced detection
  const userInfo = detectUserType(searchParamsObj, headersList, url);
  
  // Get appropriate redirect URL
  const redirectUrl = getRedirectUrl(userInfo);
  
  redirect(redirectUrl);
}
