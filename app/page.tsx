/**
 * Whop App Entry Point
 * Simple redirect: if you're the owner, go to analytics. Otherwise, go to student surveys.
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ 
    companyId?: string; 
  }>;
}) {
  const params = await searchParams;
  const companyId = params.companyId || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || '';
  
  // For now, just redirect to analytics with company ID
  // WhopClientAuth will handle student/owner detection
  redirect(`/analytics?companyId=${companyId}`);
}
