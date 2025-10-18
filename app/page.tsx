/**
 * Whop App Entry Point
 * Redirects to analytics with company ID from URL
 */

import { redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  // In Next.js 15, searchParams is a Promise
  const params = await searchParams;
  const companyId = params.companyId;
  
  if (companyId) {
    // Redirect to analytics with company ID
    redirect(`/analytics?companyId=${companyId}`);
  } else {
    // No company ID - just redirect to analytics (will show error there)
    redirect('/analytics');
  }
}
