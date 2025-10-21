'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessState {
  loading: boolean;
  isOwner: boolean;
  isStudent: boolean;
  role: string;
}

export function WhopClientAuth({ children }: { children: React.ReactNode }) {
  const [accessState, setAccessState] = useState<AccessState>({
    loading: true,
    isOwner: false,
    isStudent: false,
    role: 'unknown',
  });

  useEffect(() => {
    // SIMPLE URL-BASED DETECTION (like Whop Forms app)
    const currentUrl = window.location.href;
    
    console.log('🔐 [WhopClientAuth] Current URL:', currentUrl);
    
    // WHOP FORMS PATTERN: /joined/ = student, everything else = owner
    const isStudent = currentUrl.includes('/joined/');
    const isOwner = !isStudent;
    
    console.log('🔍 [WhopClientAuth] Detection:', { isStudent, isOwner });
    
    setAccessState({
      loading: false,
      isOwner,
      isStudent,
      role: isStudent ? 'student' : 'owner',
    });
  }, []);

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

  // Student Interface - Redirect to student surveys page
  if (accessState.isStudent) {
    // Use the existing student surveys page component
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Only redirect if not already on student surveys page
      if (!currentPath.includes('/student/surveys')) {
        window.location.href = '/student/surveys';
        return (
          <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-[#9AA4B2]">Redirecting to your surveys...</p>
            </div>
          </div>
        );
      }
    }
    
    // If already on surveys page or SSR, render the content
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
        
        {children}
      </div>
    );
  }

  // Owner access - show full dashboard
  return <>{children}</>;
}
