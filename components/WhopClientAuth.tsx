'use client';

import { useIframeSdk } from '@whop/react';
import { useEffect, useState } from 'react';
import { ShieldAlert, Crown, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessState {
  loading: boolean;
  isOwner: boolean;
  isStudent: boolean;
  role: string;
  userName?: string;
  userId?: string;
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
      console.log('🔐 [WhopClientAuth] Checking Whop iframe SDK...');
      console.log('🔐 [WhopClientAuth] SDK:', { hasSdk: !!sdk });

      if (!sdk) {
        console.log('⏳ [WhopClientAuth] Waiting for SDK...');
        setTimeout(() => {
          if (!sdk) {
            console.log('❌ [WhopClientAuth] No SDK - blocking access for security');
            setAccessState({
              loading: false,
              isOwner: false,
              isStudent: true,
              role: 'none',
              userName: 'Unknown',
            });
          }
        }, 3000);
        return;
      }

      try {
        // Get URL data from SDK (Whop Forms app pattern)
        const urlData = await sdk.getTopLevelUrlData({});
        console.log('🔐 [WhopClientAuth] SDK data:', JSON.stringify(urlData, null, 2));

        // Extract company ID for server verification
        let companyId = urlData?.companyRoute || 
                       new URLSearchParams(window.location.search).get('companyId') ||
                       process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
        
        console.log('🔍 [WhopClientAuth] Company ID:', companyId);
        console.log('🔍 [WhopClientAuth] ViewType:', urlData?.viewType);
        console.log('🔍 [WhopClientAuth] BaseHref:', urlData?.baseHref);

        // Server verification (Whop Forms app pattern)
        const response = await fetch(`/api/auth/permissions?companyId=${companyId}&viewType=${urlData?.viewType}&baseHref=${encodeURIComponent(urlData?.baseHref || '')}`);
        const data = await response.json();
        
        console.log('🔍 [WhopClientAuth] Server verification result:', data);
        
        if (data.success) {
          if (data.isOwner) {
            console.log('✅ [WhopClientAuth] Server confirmed OWNER access');
            setAccessState({
              loading: false,
              isOwner: true,
              isStudent: false,
              role: data.accessLevel || 'owner',
              userName: data.userId || 'Owner',
            });
          } else {
            console.log('✅ [WhopClientAuth] Server confirmed STUDENT access');
            setAccessState({
              loading: false,
              isOwner: false,
              isStudent: true,
              role: data.accessLevel || 'student',
              userName: data.userId || 'Student',
            });
          }
        } else {
          console.log('❌ [WhopClientAuth] Server denied access:', data.error);
          setAccessState({
            loading: false,
            isOwner: false,
            isStudent: true,
            role: 'student',
            userName: 'Student',
          });
        }
      } catch (error) {
        console.error('❌ [WhopClientAuth] Error during access check:', error);
        setAccessState({
          loading: false,
          isOwner: false,
          isStudent: true,
          role: 'student',
          userName: 'Student',
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
          
          <h2 className="text-2xl font-bold text-[#E5E7EB] mb-3">
            {accessState.isStudent ? 'Loading Student Surveys...' : 'Loading Analytics Dashboard...'}
          </h2>
          
          <p className="text-[#9AA4B2] text-lg mb-4">
            {accessState.isStudent ? 'Preparing your survey access...' : 'Verifying your access permissions'}
          </p>
        </div>
      </div>
    );
  }

  // Student Interface - Show student surveys directly
  if (accessState.isStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        {/* Student Header */}
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
        
        {/* Student Content */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-[#1A1E25] to-[#20242B] border border-[#2A2F36] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#E1E4EA] mb-2">
                  Welcome, {accessState.userName}! 👋
                </h2>
                <p className="text-[#D1D5DB]">
                  You have access to complete surveys assigned by your community. 
                  Check below for available surveys.
                </p>
              </div>
              
              {/* Student Surveys Content */}
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

  // Access denied - show restriction message
  if (!accessState.isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full border border-[#2A2F36] bg-gradient-to-br from-[#1A1E25] via-[#20242B] to-[#1A1E25] shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/30 flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#E1E4EA]">
              Owner Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-lg text-[#D1D5DB]">
                Hi <span className="text-[#10B981] font-bold">{accessState.userName}</span>! 👋
              </p>
              <p className="text-lg text-[#D1D5DB]">
                This analytics dashboard is designed exclusively for <span className="text-[#10B981] font-bold">community owners</span> to manage and analyze their data.
              </p>
              <p className="text-[#9AA4B2]">
                You're currently accessing this as a <span className="font-semibold text-[#E1E4EA]">{accessState.role}</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Owner access - show full dashboard
  return <>{children}</>;
}