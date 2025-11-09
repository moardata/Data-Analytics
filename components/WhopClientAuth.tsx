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
      let companyId = '';
      
      try {
        // Safety check for window object
        if (typeof window === 'undefined') {
          return;
        }

        // Get company ID from URL (Whop injects this when embedding)
        const params = new URLSearchParams(window.location.search);
        companyId = params.get('companyId') || 
                    params.get('company_id') ||
                    window.location.pathname.split('/').find(part => part.startsWith('biz_')) || 
                    '';

        if (!companyId) {
          // No company ID - show student interface
          setAccessState({
            loading: false,
            isOwner: false,
            isStudent: true,
            role: 'student',
            companyId: '',
          });
          return;
        }

        // Check permissions via server API (uses proper Whop auth)
        try {
          const response = await fetch(`/api/auth/permissions?companyId=${companyId}`);
          
          if (!response.ok) {
            // Auth failed - show student interface
            setAccessState({
              loading: false,
              isOwner: false,
              isStudent: true,
              role: 'student',
              companyId: companyId,
            });
            return;
          }
          
          const data = await response.json();
          
          if (data.success && data.isOwner) {
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
          console.error('❌ [WhopClientAuth] Error checking permissions:', error);
          // Fail securely - show student interface on error
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
        // Fail securely - show student interface
        setAccessState({
          loading: false,
          isOwner: false,
          isStudent: true,
          role: 'student',
          companyId: companyId || '',
        });
      }
    }

    checkAccess();
  }, []);

  // Loading state
  if (accessState.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Checking access...</h2>
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
