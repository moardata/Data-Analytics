'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import StudentSurveysInterface from './StudentSurveysInterface';

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
      console.log('🔐 [WhopClientAuth] Checking owner status via server...');

      // Get company ID from URL
      const params = new URLSearchParams(window.location.search);
      const companyId = params.get('companyId') || 
                       window.location.pathname.split('/').find(part => part.startsWith('biz_'));

      console.log('🔍 [WhopClientAuth] Company ID:', companyId);

      if (!companyId) {
        console.log('❌ [WhopClientAuth] No company ID - defaulting to student');
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
        console.log('🔍 [WhopClientAuth] Calling debug endpoint to see headers...');
        const debugResponse = await fetch('/api/debug/headers');
        const debugData = await debugResponse.json();
        console.log('📋 [WhopClientAuth] Headers from server:', debugData);
      } catch (debugError) {
        console.error('⚠️ [WhopClientAuth] Debug endpoint error:', debugError);
      }

      // Check owner status via our server API (which has Whop headers)
      try {
        console.log('🔍 [WhopClientAuth] Calling server to check ownership...');
        
        const response = await fetch(`/api/auth/check-owner?companyId=${companyId}`);
        const data = await response.json();
        
        console.log('🔍 [WhopClientAuth] Server response:', data);
        console.log('🔍 [WhopClientAuth] Full response details:', JSON.stringify(data, null, 2));
        
        // Log debug info if available
        if (data.debug) {
          console.log('🔍 [WhopClientAuth] DEBUG INFO:');
          console.log('  - Current user_id:', data.debug.user_id);
          console.log('  - Access level:', data.debug.access_level);
          console.log('  - Has access:', data.debug.has_access);
          console.log('  - Method:', data.method);
        }
        
        // Check if this is a temporary/fallback response
        if (data.temporary) {
          console.warn('⚠️ [WhopClientAuth] TEMPORARY AUTH - Not using real Whop authentication!');
          console.warn('⚠️ [WhopClientAuth] Reason:', data.reason || data.error || 'Unknown');
        }
        
        if (data.isOwner) {
          console.log('✅ [WhopClientAuth] User IS the owner');
          setAccessState({
            loading: false,
            isOwner: true,
            isStudent: false,
            role: 'owner',
            companyId: companyId,
          });
        } else {
          console.log('✅ [WhopClientAuth] User is NOT the owner (student)');
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
    }

    checkAccess();
  }, []);

  // Loading state
  if (accessState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#E5E7EB] mb-3">Checking access...</h2>
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
