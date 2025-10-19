/**
 * Owner-Only Access Guard
 * Restricts app access to company owners only
 * Shows friendly message to students/members
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, Crown, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OwnerCheckResult {
  isOwner: boolean;
  accessLevel: 'owner' | 'admin' | 'member' | 'student' | 'none';
  loading: boolean;
  error?: string;
}

export function OwnerOnlyGuard({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  
  // Get companyId from URL params OR environment variable
  const companyId = searchParams.get('companyId') || 
                    searchParams.get('company_id') || 
                    process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [ownerCheck, setOwnerCheck] = useState<OwnerCheckResult>({
    isOwner: false,
    accessLevel: 'none',
    loading: true,
  });

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (ownerCheck.loading) {
        console.error('⏰ [OwnerOnlyGuard] Timeout - no companyId after 10 seconds');
        setOwnerCheck({
          isOwner: false,
          accessLevel: 'none',
          loading: false,
          error: 'Timeout - unable to identify community',
        });
      }
    }, 10000); // 10 second timeout

    async function checkOwnership() {
      console.log('🔐 [OwnerOnlyGuard] Starting check with companyId:', companyId);
      
      // SECURITY: Wait for companyId to be available before making access decisions
      if (!companyId) {
        console.log('⏳ [OwnerOnlyGuard] No company ID yet - staying in loading state');
        // Keep loading state - don't make any access decisions yet
        return;
      }

      // Clear timeout since we have companyId
      clearTimeout(timeoutId);

      try {
        console.log('🔍 [OwnerOnlyGuard] Calling role check API...');
        const response = await fetch(`/api/auth/check-role?companyId=${companyId}`);
        
        if (!response.ok) {
          console.error('❌ [OwnerOnlyGuard] API response not OK:', response.status, response.statusText);
          // BLOCK ACCESS on API error (fail-closed for security)
          setOwnerCheck({
            isOwner: false,
            accessLevel: 'none',
            loading: false,
            error: 'Failed to verify access - API error',
          });
          return;
        }
        
        const data = await response.json();
        console.log('✅ [OwnerOnlyGuard] Role check response:', data);

        setOwnerCheck({
          isOwner: data.isOwner || false,
          accessLevel: data.role || 'student',
          loading: false,
        });
      } catch (error) {
        console.error('❌ [OwnerOnlyGuard] Error checking role:', error);
        // BLOCK ACCESS on error (fail-closed for security)
        setOwnerCheck({
          isOwner: false,
          accessLevel: 'none',
          loading: false,
          error: 'Failed to verify access - network error',
        });
      }
    }

    checkOwnership();

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [companyId, ownerCheck.loading]);

  // Loading state - wait for companyId and then verify access
  if (ownerCheck.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          
          <h2 className="text-2xl font-bold text-[#E5E7EB] mb-3">
            {!companyId ? 'Loading App...' : 'Verifying Access...'}
          </h2>
          
          <p className="text-[#9AA4B2] text-lg mb-4">
            {!companyId 
              ? 'Please wait while we load your community information.'
              : 'Checking your permissions for this analytics dashboard.'
            }
          </p>
          
          {!companyId && (
            <div className="bg-[#1A1E25] border border-[#2A2F36] rounded-lg p-4 mt-4">
              <p className="text-sm text-[#9AA4B2]">
                <span className="text-[#10B981] font-semibold">Note:</span> This app requires access through Whop to identify your community.
              </p>
            </div>
          )}
          
          {companyId && (
            <div className="bg-[#1A1E25] border border-[#2A2F36] rounded-lg p-4 mt-4">
              <p className="text-sm text-[#9AA4B2]">
                <span className="text-[#10B981] font-semibold">Community ID:</span> {companyId}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Access denied - show restriction message
  if (!ownerCheck.isOwner) {
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
                This analytics dashboard is designed exclusively for <span className="text-[#10B981] font-bold">community owners</span> to manage and analyze their data.
              </p>
              <p className="text-[#9AA4B2]">
                You're currently accessing this as a <span className="font-semibold text-[#E1E4EA]">{ownerCheck.accessLevel}</span>.
              </p>
            </div>

            {/* Access levels explanation */}
            <div className="bg-[#12151A] border border-[#2A2F36] rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[#E1E4EA] mb-1">Owner Access</div>
                  <div className="text-sm text-[#9AA4B2]">
                    Full access to analytics, insights, revenue tracking, and student management
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 opacity-50">
                <Users className="h-5 w-5 text-[#9AA4B2] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[#E1E4EA] mb-1">Member/Student Access</div>
                  <div className="text-sm text-[#9AA4B2]">
                    Access to course content and community features (not this admin dashboard)
                  </div>
                </div>
              </div>
            </div>

            {/* What to do */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-400 text-2xl">💡</div>
                <div className="flex-1">
                  <div className="font-semibold text-blue-300 mb-1">Need Access?</div>
                  <div className="text-sm text-blue-200">
                    If you're the owner of this community, make sure you're logged in with the correct account. If you need help, contact your community administrator.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-[#2A2F36]">
              <p className="text-sm text-[#9AA4B2]">
                This security measure ensures your community's data stays private and secure.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted - render children
  return <>{children}</>;
}

