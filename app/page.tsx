/**
 * Whop App Entry Point
 * Redirects to analytics with company ID from URL
 */

import { redirect } from 'next/navigation';

export default function Page({
  searchParams,
}: {
  searchParams: { companyId?: string };
}) {
  // Get company ID from URL (Whop injects this)
  const companyId = searchParams.companyId;
  
  if (companyId) {
    // Redirect to analytics with company ID
    redirect(`/analytics?companyId=${companyId}`);
  } else {
    // No company ID - just redirect to analytics (will show error there)
    redirect('/analytics');
  }
}

