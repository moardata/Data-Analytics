/**
 * Analytics Experience View
 * Main entry point when app is opened through Whop
 * 
 * URL: /experiences/[experienceId]
 * This is the proper Whop app pattern
 */

import { redirect } from 'next/navigation';

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  
  // Redirect to analytics with experienceId
  // The analytics page will handle auth and fetch company data
  redirect(`/analytics?experienceId=${experienceId}`);
}
