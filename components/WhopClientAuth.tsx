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
}

export function WhopClientAuth({ children }: { children: React.ReactNode }) {
  const [accessState, setAccessState] = useState<AccessState>({
    loading: true,
    isOwner: false,
    isStudent: false,
    role: 'unknown',
    companyId: '',
  });

  useEffect(() => {
    async function checkAccess() {
      try {
        
        // Safety check for window object
        if (typeof window === 'undefined') {
          console.warn('⚠️ [WhopClientAuth] Window object not available (SSR)');
          return;
        }


        // Get company ID from URL
        const params = new URLSearchParams(window.location.search);
        const companyId = params.get('companyId') || 
                         window.location.pathname.split('/').find(part => part.startsWith('biz_')) || 
                         '';


        if (!companyId) {
          setAccessState({
            loading: false,
            isOwner: false,
            isStudent: true,
            role: 'student',
            companyId: '',
          });
          return;
        }

      // FIRST: Check what headers Whop is actually sending
      try {
        const debugResponse = await fetch('/api/debug/headers');
        const debugData = await debugResponse.json();
      } catch (debugError) {
        console.error('⚠️ [WhopClientAuth] Debug endpoint error:', debugError);
      }

      // Check owner status via our server API (which has Whop headers)
      try {
        
        const response = await fetch(`/api/auth/check-owner?companyId=${companyId}`);
        const data = await response.json();
        
        
        // Log debug info if available
        if (data.debug) {
        }
        
        // Check if this is a temporary/fallback response
        if (data.temporary) {
          console.warn('⚠️ [WhopClientAuth] TEMPORARY AUTH - Not using real Whop authentication!');
          console.warn('⚠️ [WhopClientAuth] Reason:', data.reason || data.error || 'Unknown');
        }
        
        if (data.isOwner) {
          setAccessState({
            loading: false,
            isOwner: true,
            isStudent: false,
            role: 'owner',
            companyId: companyId,
          });
        } else {
          setAccessState({
            loading: false,
            isOwner: false,
            isStudent: true,
            role: 'student',
            companyId: companyId,
          });
        }
      } catch (error) {
        console.error('❌ [WhopClientAuth] Error:', error);
        // Default to student on error (fail-closed)
        setAccessState({
          loading: false,
          isOwner: false,
          isStudent: true,
          role: 'student',
          companyId: companyId,
        });
      }
      } catch (error) {
        console.error('❌ [WhopClientAuth] Fatal error:', error);
        // Default to student on fatal error
        setAccessState({
          loading: false,
          isOwner: false,
          isStudent: true,
          role: 'student',
          companyId: '',
        });
      }
    }

    checkAccess();
  }, []);

  // Loading state
  if (accessState.loading) {
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
    return <StudentSurveysInterface companyId={accessState.companyId} />;
  }

  // Owner access - show full dashboard
  return <>{children}</>;
}
