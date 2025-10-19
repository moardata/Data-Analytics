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
  
  try {
    // Verify user authentication
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    if (!userId) {
      return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-2">Authentication Required</div>
            <div className="text-[#9AA4B2] text-sm">
              Please access this app through Whop.
            </div>
          </div>
        </div>
      );
    }

    // Check if user has access to this experience
    const hasAccess = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!hasAccess.hasAccess) {
      return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-2">Access Denied</div>
            <div className="text-[#9AA4B2] text-sm">
              You don't have access to this analytics dashboard.
            </div>
          </div>
        </div>
      );
    }

    // Get experience details (includes company info)
    // This will be needed to pass to the analytics page
    
    // Redirect to analytics with experienceId
    // The analytics page will use this to fetch company data
    redirect(`/analytics?experienceId=${experienceId}`);
    
  } catch (error) {
    console.error('Error in experience page:', error);
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">Error</div>
          <div className="text-[#9AA4B2] text-sm">
            {error instanceof Error ? error.message : 'Failed to load experience'}
          </div>
        </div>
      </div>
    );
  }
}
