/**
 * Whop Client-Side Authentication
 * Uses @whop/react hooks with improved student/operator detection
 * Based on Whop Forms app pattern analysis
 */

'use client';

import { useIframeSdk } from '@whop/react';
import { useEffect, useState } from 'react';
import { ShieldAlert, Crown, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { detectUserType, getRedirectUrl } from '@/lib/auth/user-detection';

interface AccessState {
  loading: boolean;
  isOwner: boolean;
  isStudent: boolean;
  role: string;
  userName?: string;
  userId?: string;
  redirectUrl?: string;
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
        // Wait for SDK to load
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
        // Get URL data from SDK to determine view type
        const urlData = await sdk.getTopLevelUrlData({});

        console.log('🔐 [WhopClientAuth] SDK data (FULL):', JSON.stringify(urlData, null, 2));
        console.log('🔐 [WhopClientAuth] ViewType:', urlData?.viewType);
        console.log('🔐 [WhopClientAuth] All URL data keys:', Object.keys(urlData || {}));

        // Use improved user detection logic with SDK data
        const searchParams = new URLSearchParams(window.location.search);
        const sdkUrl = urlData?.baseHref || urlData?.fullHref || window.location.href;
        const userInfo = detectUserType(searchParams, undefined, sdkUrl);
        
        console.log('🔍 [WhopClientAuth] User detection result:', userInfo);
        console.log('🔍 [WhopClientAuth] Current URL:', window.location.href);
        console.log('🔍 [WhopClientAuth] SDK URL (baseHref):', sdkUrl);
        console.log('🔍 [WhopClientAuth] SDK URL includes /joined/:', sdkUrl.includes('/joined/'));
        console.log('🔍 [WhopClientAuth] SDK URL includes /app/:', sdkUrl.includes('/app/'));
        console.log('🔍 [WhopClientAuth] ViewType from SDK:', urlData?.viewType);
        
        // Check if this is a student access
        if (userInfo.isStudent) {
          console.log('🎓 [WhopClientAuth] Student detected - redirecting to surveys');
          const redirectUrl = getRedirectUrl(userInfo);
          setAccessState({
            loading: false,
            isOwner: false,
            isStudent: true,
            role: 'student',
            userName: 'Student',
            redirectUrl,
          });
          return;
        }
        
        // For operators, verify ownership via server-side API
        console.log('👑 [WhopClientAuth] Operator detected - verifying ownership');
        
        try {
          // Extract company ID from various sources
          let companyId = userInfo.companyId || 
                         new URLSearchParams(window.location.search).get('companyId') || 
                         new URLSearchParams(window.location.search).get('company_id') ||
                         process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
          
          // If no companyId in URL params, try to extract from URL data
          if (!companyId && urlData) {
            // Try to get company ID from experience ID or company route
            if (urlData.experienceId) {
              // Map experience ID to company ID
              const experienceToCompanyMap: Record<string, string> = {
                'exp_2BXhmdlqcnLGc5': 'biz_3GYHNPbGkZCEky', // Your experience -> your company
              };
              companyId = experienceToCompanyMap[urlData.experienceId] || 'biz_3GYHNPbGkZCEky';
              console.log('🔍 [WhopClientAuth] Mapped experience to company:', urlData.experienceId, '->', companyId);
            } else if (urlData.companyRoute) {
              // Map company route to company ID
              const routeToCompanyMap: Record<string, string> = {
                'live-analytics': 'biz_3GYHNPbGkZCEky',
                'creator-analytics': 'biz_3GYHNPbGkZCEky',
                'data-analytics': 'biz_3GYHNPbGkZCEky',
              };
              companyId = routeToCompanyMap[urlData.companyRoute] || 'biz_3GYHNPbGkZCEky';
              console.log('🔍 [WhopClientAuth] Mapped route to company:', urlData.companyRoute, '->', companyId);
            }
          }
          
          console.log('🔍 [WhopClientAuth] DEBUG - URL search params:', Object.fromEntries(new URLSearchParams(window.location.search).entries()));
          console.log('🔍 [WhopClientAuth] DEBUG - Full URL:', window.location.href);
          console.log('🔍 [WhopClientAuth] DEBUG - URL Data:', urlData);
          console.log('🔍 [WhopClientAuth] DEBUG - Company ID found:', companyId);
          
          if (!companyId) {
            console.log('❌ [WhopClientAuth] No company ID found - trying fallback');
            // Try to get company ID from URL path or other sources
            const pathParts = window.location.pathname.split('/');
            const possibleCompanyId = pathParts.find(part => part.startsWith('biz_'));
            
            if (possibleCompanyId) {
              console.log('🔍 [WhopClientAuth] Found company ID in URL path:', possibleCompanyId);
              // Use the company ID from URL path
              const response = await fetch(`/api/auth/permissions?companyId=${possibleCompanyId}`);
              const data = await response.json();
              
              console.log('🔍 [WhopClientAuth] Server verification result (from path):', data);
              
              if (data.success && data.isOwner) {
                console.log('✅ [WhopClientAuth] Server confirmed owner access (from path)');
                setAccessState({
                  loading: false,
                  isOwner: true,
                  isStudent: false,
                  role: data.accessLevel || 'owner',
                  userName: data.userId || 'Owner',
                });
                return;
              }
            }
            
            console.log('❌ [WhopClientAuth] No company ID found anywhere');
            setAccessState({
              loading: false,
              isOwner: false,
              isStudent: true,
              role: 'none',
              userName: 'Unknown',
            });
            return;
          }
          
          console.log('🔍 [WhopClientAuth] Verifying ownership via server for company:', companyId);
          
          // Call our permissions API to verify ownership
          const response = await fetch(`/api/auth/permissions?companyId=${companyId}`);
          const data = await response.json();
          
          console.log('🔍 [WhopClientAuth] Server verification result:', data);
          
          if (data.success && data.isOwner) {
            console.log('✅ [WhopClientAuth] Server confirmed owner access');
            setAccessState({
              loading: false,
              isOwner: true,
              isStudent: false,
              role: data.accessLevel || 'owner',
              userName: data.userId || 'Owner',
            });
          } else {
            console.log('❌ [WhopClientAuth] Server denied access:', data.error);
            setAccessState({
              loading: false,
              isOwner: false,
              isStudent: true,
              role: data.accessLevel || 'student',
              userName: data.userId || 'Student',
            });
          }
        } catch (serverError) {
          console.error('❌ [WhopClientAuth] Server verification failed:', serverError);
          // On server error, grant access (fail-open for debugging)
          console.warn('⚠️ [WhopClientAuth] Server error - granting access as fallback');
          setAccessState({
            loading: false,
            isOwner: true,
            isStudent: false,
            role: 'owner',
            userName: 'User',
          });
        }
        
        return; // Exit early since we handled authentication

      } catch (error) {
        console.error('❌ [WhopClientAuth] Error getting SDK data:', error);
        // On error, GRANT ACCESS (fail-open for now while debugging)
        console.warn('⚠️ [WhopClientAuth] Error - granting access as fallback');
        setAccessState({
          loading: false,
          isOwner: true,
          isStudent: false,
          role: 'owner',
          userName: 'User',
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
            Loading Analytics Dashboard...
          </h2>
          
          <p className="text-[#9AA4B2] text-lg mb-4">
            Verifying your access permissions
          </p>
        </div>
      </div>
    );
  }

  // Student redirect
  if (accessState.isStudent && accessState.redirectUrl) {
    // Redirect to student surveys page
    window.location.href = accessState.redirectUrl;
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          
          <h2 className="text-2xl font-bold text-[#E5E7EB] mb-3">
            Redirecting to Surveys...
          </h2>
          
          <p className="text-[#9AA4B2] text-lg mb-4">
            Taking you to your student surveys
          </p>
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
            {/* Main message */}
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

            {/* What students can do */}
            <div className="bg-gradient-to-r from-[#1A1E25] to-[#20242B] rounded-lg p-6 border border-[#2A2F36]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-[#E1E4EA]">Student Access</h3>
              </div>
              <p className="text-[#D1D5DB] mb-4">
                As a student, you can access surveys and forms assigned to you by your community owner.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.location.href = '/student/surveys'}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Go to Surveys
                </button>
              </div>
            </div>

            {/* Contact info */}
            <div className="text-center pt-4 border-t border-[#2A2F36]">
              <p className="text-[#9AA4B2] text-sm">
                Need help? Contact your community owner or administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Owner access granted - show the app
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
      {/* Success indicator */}
      <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-b border-green-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 flex items-center justify-center">
              <Crown className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-green-500 font-semibold">
                ✅ Authenticated as: <span className="text-white">{accessState.role}</span>
              </p>
              <p className="text-green-400/80 text-sm">
                Welcome back, {accessState.userName}!
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-400/80 text-sm">
              Company ID: {new URLSearchParams(window.location.search).get('companyId') || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Main app content */}
      {children}
    </div>
  );
}