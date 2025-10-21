/**
 * Whop App Entry Point
 * Redirects based on user type: students to surveys, operators to analytics
 */

import { redirect } from 'next/navigation';
import { detectUserType, getRedirectUrl } from '@/lib/auth/user-detection';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; userId?: string; userType?: string }>;
}) {
  // In Next.js 15, searchParams is a Promise
  const params = await searchParams;
  
  // Convert to URLSearchParams for detection
  const searchParamsObj = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParamsObj.set(key, value);
  });
  
  // Detect user type
  const userInfo = detectUserType(searchParamsObj);
  
  // Get appropriate redirect URL
  const redirectUrl = getRedirectUrl(userInfo);
  
  redirect(redirectUrl);
}
