'use client';

import { useIframeSdk } from '@whop/react';
import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface AccessState {
  loading: boolean;
  isOwner: boolean;
  isStudent: boolean;
  role: string;
}

export function WhopClientAuth({ children }: { children: React.ReactNode }) {
  const sdk = useIframeSdk();
  
  const [accessState, setAccessState] = useState<AccessState>({
    loading: true,
    isOwner: false,
    isStudent: false,
    role: 'unknown',
  });

  useEffect(() => {
    async function checkAccess() {
      console.log('🔐 [WhopClientAuth] Checking SDK...');

      if (!sdk) {
        console.log('⏳ [WhopClientAuth] Waiting for SDK...');
        setTimeout(() => {
          if (!sdk) {
            console.log('❌ [WhopClientAuth] No SDK - defaulting to owner');
            setAccessState({
              loading: false,
              isOwner: true,
              isStudent: false,
              role: 'owner',
            });
          }
        }, 2000);
        return;
      }

      try {
        // Get URL data from SDK (THIS is the real Whop URL)
        const urlData = await sdk.getTopLevelUrlData({});
        const whopUrl = urlData?.baseHref || urlData?.fullHref || '';
        
        console.log('🔐 [WhopClientAuth] Whop URL from SDK:', whopUrl);
        console.log('🔐 [WhopClientAuth] Checking for /joined/ pattern...');
        console.log('🔐 [WhopClientAuth] URL includes /joined/:', whopUrl.includes('/joined/'));
        
        // WHOP FORMS PATTERN: /joined/ in SDK baseHref = student
        const isStudent = whopUrl.includes('/joined/');
        const isOwner = !isStudent;
        
        console.log('🔍 [WhopClientAuth] FINAL Detection:', { isStudent, isOwner });
        console.log('🔍 [WhopClientAuth] Will show:', isStudent ? 'STUDENT INTERFACE' : 'OWNER DASHBOARD');
        
        setAccessState({
          loading: false,
          isOwner,
          isStudent,
          role: isStudent ? 'student' : 'owner',
        });
      } catch (error) {
        console.error('❌ [WhopClientAuth] Error:', error);
        // Default to owner on error
        setAccessState({
          loading: false,
          isOwner: true,
          isStudent: false,
          role: 'owner',
        });
      }
    }

    checkAccess();
  }, [sdk]);

  // Loading state
  if (accessState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#E5E7EB] mb-3">Loading...</h2>
        </div>
      </div>
    );
  }

  // Student Interface
  if (accessState.isStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="bg-[#12151A] border-b border-[#2A2F36] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#E1E4EA]">Student Surveys</h1>
              <p className="text-[#9AA4B2]">Complete your assigned surveys</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#9AA4B2]">Student View</span>
              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              <div className="bg-gradient-to-r from-[#1A1E25] to-[#20242B] border border-[#2A2F36] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#E1E4EA] mb-2">
                  Welcome, Student! 👋
                </h2>
                <p className="text-[#D1D5DB]">
                  You have access to complete surveys assigned by your community.
                </p>
              </div>
              
              <div className="bg-[#1A1E25] border border-[#2A2F36] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#E1E4EA] mb-4">Available Surveys</h3>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-[#10B981]" />
                  </div>
                  <p className="text-[#9AA4B2] mb-4">No surveys available at the moment</p>
                  <p className="text-sm text-[#6B7280]">
                    Your community owner will assign surveys for you to complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Owner access - show full dashboard
  return <>{children}</>;
}
