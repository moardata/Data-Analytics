'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useCompanyContext } from '@/lib/hooks/useCompanyContext';

interface AccessGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Access Guard Component
 * Protects the entire app from unauthorized access
 * Only allows course owners and admins to access analytics
 */
export function AccessGuard({ children, fallback }: AccessGuardProps) {
  const { companyId, loading: companyLoading, error: companyError } = useCompanyContext();
  const [permissions, setPermissions] = useState<{
    isAuthorized: boolean;
    userRole: string;
    loading: boolean;
    error: string | null;
  }>({
    isAuthorized: false,
    userRole: 'unknown',
    loading: true,
    error: null
  });

  useEffect(() => {
    async function checkPermissions() {
      if (!companyId) {
        setPermissions({
          isAuthorized: false,
          userRole: 'unknown',
          loading: false,
          error: 'No company context found'
        });
        return;
      }

      try {
        setPermissions(prev => ({ ...prev, loading: true, error: null }));

        const response = await fetch('/api/auth/permissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyId })
        });

        const data = await response.json();

        if (data.success) {
          setPermissions({
            isAuthorized: data.permissions.isAuthorized,
            userRole: data.permissions.userRole,
            loading: false,
            error: null
          });
        } else {
          setPermissions({
            isAuthorized: false,
            userRole: 'unknown',
            loading: false,
            error: data.error || 'Failed to check permissions'
          });
        }
      } catch (error) {
        setPermissions({
          isAuthorized: false,
          userRole: 'unknown',
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (!companyLoading) {
      checkPermissions();
    }
  }, [companyId, companyLoading]);

  // Show loading state
  if (companyLoading || permissions.loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-[#D1D5DB] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (companyError || permissions.error) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-400 text-xl mb-2">Access Error</div>
          <div className="text-[#9AA4B2] text-sm mb-6">
            {companyError || permissions.error}
          </div>
          <div className="text-[#9AA4B2] text-xs">
            Please ensure you are accessing this app through Whop with proper permissions.
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authorized
  if (!permissions.isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-400 text-xl mb-2">Access Restricted</div>
          <div className="text-[#9AA4B2] text-sm mb-6">
            Only course owners and administrators can access analytics data.
          </div>
          <div className="text-[#9AA4B2] text-xs mb-4">
            Your role: <span className="text-[#10B981]">{permissions.userRole}</span>
          </div>
          <div className="text-[#9AA4B2] text-xs">
            If you believe this is an error, please contact your course administrator.
          </div>
        </div>
      </div>
    );
  }

  // User is authorized, show the app
  return <>{children}</>;
}

/**
 * Hook to get current user permissions
 */
export function usePermissions() {
  const { companyId } = useCompanyContext();
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPermissions() {
      if (!companyId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/auth/permissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyId })
        });

        const data = await response.json();

        if (data.success) {
          setPermissions(data.permissions);
        } else {
          setError(data.error || 'Failed to get permissions');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [companyId]);

  return { permissions, loading, error };
}
