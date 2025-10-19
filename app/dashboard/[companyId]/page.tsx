/**
 * Dynamic Dashboard Route for Whop Integration
 * Validates user access and shows appropriate view
 */

import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  
  // For now, just redirect to analytics with the companyId
  // Authentication will be handled by the analytics page
  // This allows the app to work in both test mode and production
  console.log('📊 Dashboard accessed for company:', companyId);
  redirect(`/analytics?companyId=${companyId}`);
}
