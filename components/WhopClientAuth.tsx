'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import StudentSurveysInterface from '@/components/StudentSurveysInterface';

interface AccessState {
  loading: boolean;
  isOwner: boolean;
  isStudent: boolean;
  role: string;
  companyId: string;
  error?: 'app_not_installed' | null;
}

export function WhopClientAuth({ children }: { children: React.ReactNode }) {
  const [accessState, setAccessState] = useState<AccessState>({
    loading: true,
    isOwner: false,
    isStudent: false,
    role: 'unknown',
    companyId: '',
    error: null,
  });

  useEffect(() => {
    async function checkAccess() {
      try {
        // Safety check for window object
        if (typeof window === 'undefined') {
          console.warn('⚠️ [WhopClientAuth] Window object not available (SSR)');
          return;
        }

        // Get company ID from URL with multiple extraction methods
        const params = new URLSearchParams(window.location.search);
        const companyId = params.get('companyId') || 
                         params.get('company_id') ||
                         window.location.pathname.split('/').find(part => part.startsWith('biz_')) || 
                         '';

        console.log('🔍 [WhopClientAuth] Extracted company ID:', companyId);
        console.log('🔍 [WhopClientAuth] Full URL:', window.location.href);

        if (!companyId) {
          console.warn('⚠️ [WhopClientAuth] No company ID found - defaulting to STUDENT mode');
          setAccessState({
            loading: false,
            isOwner: false,
            isStudent: true,
            role: 'student',
            companyId: '',
          });
          return;
        }

        // FIRST: Check what headers Whop is actually sending (non-blocking)
        try {
          const debugResponse = await fetch('/api/debug/headers');
          const debugData = await debugResponse.json();
          console.log('🔧 [WhopClientAuth] Debug headers:', JSON.stringify(debugData, null, 2));
        } catch (debugError) {
          console.error('⚠️ [WhopClientAuth] Debug endpoint error:', debugError);
        }

        // Run full diagnostics
        try {
          const diagnosticResponse = await fetch(`/api/auth/diagnose?companyId=${companyId}`);
          const diagnosticData = await diagnosticResponse.json();
          console.log('🔬 [WhopClientAuth] Full diagnostics:');
          console.log(JSON.stringify(diagnosticData, null, 2));
        } catch (diagError) {
          console.error('⚠️ [WhopClientAuth] Diagnostic endpoint error:', diagError);
        }

        // Check owner status via our server API (which has Whop headers)
        try {
          console.log('🔐 [WhopClientAuth] Checking owner access for:', companyId);
          const response = await fetch(`/api/auth/check-owner?companyId=${companyId}`);
          const data = await response.json();
          
          console.log('📋 [WhopClientAuth] Check-owner response:');
          console.log(JSON.stringify(data, null, 2));
          
          // Check if this is a temporary/fallback response
          if (data.temporary) {
            console.warn('⚠️ [WhopClientAuth] TEMPORARY AUTH - Not using real Whop authentication!');
            console.warn('⚠️ [WhopClientAuth] Reason:', data.reason || data.error || 'Unknown');
          }
          
          if (data.isOwner) {
            console.log('✅ [WhopClientAuth] Setting OWNER access for company:', companyId);
            setAccessState({
              loading: false,
              isOwner: true,
              isStudent: false,
              role: 'owner',
              companyId: companyId,
            });
          } else {
            // Check if the error is about app not being installed
            const errorMessage = data.details || data.error || '';
            const isAppNotInstalled = errorMessage.includes('install the app on this company');
            
            if (isAppNotInstalled) {
              console.error('❌ [WhopClientAuth] APP NOT INSTALLED on this company!');
              console.error('❌ [WhopClientAuth] Please install the app on company:', companyId);
            }
            
            console.log('👤 [WhopClientAuth] Setting STUDENT access for company:', companyId);
            setAccessState({
              loading: false,
              isOwner: false,
              isStudent: true,
              role: 'student',
              companyId: companyId,
            });
          }
        } catch (error) {
          console.error('❌ [WhopClientAuth] Error calling check-owner:', error);
          // TEMPORARY: Default to owner on error to prevent lockout
          console.warn('⚠️ [WhopClientAuth] Auth check failed - defaulting to OWNER mode (temporary workaround)');
          
          setAccessState({
            loading: false,
            isOwner: true,
            isStudent: false,
            role: 'owner',
            companyId: companyId,
          });
        }
      } catch (error) {
        console.error('❌ [WhopClientAuth] Fatal error:', error);
        // TEMPORARY: Default to owner on fatal error to prevent lockout
        setAccessState({
          loading: false,
          isOwner: true,
          isStudent: false,
          role: 'owner',
          companyId: companyId,
        });
      }
    }

    checkAccess();
  }, []);

  // Loading state
  if (accessState.loading) {
    console.log('🔄 [WhopClientAuth] Rendering: LOADING state');
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-3">Checking access...</h2>
        </div>
      </div>
    );
  }

  // Student Interface
  if (accessState.isStudent) {
    console.log('👤 [WhopClientAuth] Rendering: STUDENT interface', { 
      companyId: accessState.companyId,
      isOwner: accessState.isOwner,
      isStudent: accessState.isStudent,
      role: accessState.role
    });
    return <StudentSurveysInterface companyId={accessState.companyId} />;
  }

  // Owner access - show full dashboard
  console.log('✅ [WhopClientAuth] Rendering: OWNER dashboard', {
    companyId: accessState.companyId,
    isOwner: accessState.isOwner,
    isStudent: accessState.isStudent,
    role: accessState.role
  });
  return <>{children}</>;
}
