/**
 * Dynamic Dashboard Route for Whop Integration
 * Passes companyId from URL to analytics page
 */

import { redirect } from 'next/navigation';

export default async function DashboardPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  // Pass companyId via URL param for multi-tenancy
  redirect(`/analytics?companyId=${companyId}`);
}
