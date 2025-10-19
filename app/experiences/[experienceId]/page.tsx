/**
 * Analytics Experience View
 * Main entry point when app is opened through Whop
 * 
 * URL: /experiences/[experienceId]
 * This is the proper Whop app pattern
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { whopSdk } from '@/lib/whop-sdk';

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  
  // Just redirect to analytics with experienceId
  // The analytics page will handle auth
  redirect(`/analytics?experienceId=${experienceId}`);
}
