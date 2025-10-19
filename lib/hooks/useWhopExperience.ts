/**
 * Whop Experience Hook
 * Handles experience-based authentication and access
 * 
 * This is the CORRECT pattern for Whop apps (Oct 2025)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export interface WhopExperienceState {
  // Experience context
  experienceId: string | null;
  companyId: string | null;
  
  // Authentication
  userId: string | null;
  isAuthenticated: boolean;
  
  // Access
  hasAccess: boolean;
  accessLevel: 'admin' | 'customer' | 'no_access';
  
  // Status
  loading: boolean;
  error: string | null;
  
  // Convenience flags
  isAdmin: boolean;
  isCustomer: boolean;
}

/**
 * Hook for experience-based Whop auth
 * This is how Whop apps SHOULD work
 */
export function useWhopExperience(): WhopExperienceState {
  const searchParams = useSearchParams();
  
  const [state, setState] = useState<WhopExperienceState>({
    experienceId: null,
    companyId: null,
    userId: null,
    isAuthenticated: false,
    hasAccess: false,
    accessLevel: 'no_access',
    loading: true,
    error: null,
    isAdmin: false,
    isCustomer: false,
  });

  useEffect(() => {
    async function checkAccess() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Get experienceId from URL
        const experienceId = searchParams.get('experienceId');
        
        if (!experienceId) {
          setState({
            experienceId: null,
            companyId: null,
            userId: null,
            isAuthenticated: false,
            hasAccess: false,
            accessLevel: 'no_access',
            loading: false,
            error: 'No experience ID provided. Access through Whop.',
            isAdmin: false,
            isCustomer: false,
          });
          return;
        }

        console.log('✅ Experience ID:', experienceId);

        // Check access via API
        const response = await fetch(`/api/experiences/${experienceId}/access`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`Access check failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Access denied');
        }

        const { hasAccess, accessLevel, userId, companyId } = data;

        setState({
          experienceId,
          companyId,
          userId,
          isAuthenticated: !!userId,
          hasAccess,
          accessLevel: accessLevel || 'no_access',
          loading: false,
          error: null,
          isAdmin: accessLevel === 'admin',
          isCustomer: accessLevel === 'customer',
        });

      } catch (error) {
        console.error('❌ Experience access check failed:', error);
        
        setState({
          experienceId: null,
          companyId: null,
          userId: null,
          isAuthenticated: false,
          hasAccess: false,
          accessLevel: 'no_access',
          loading: false,
          error: error instanceof Error ? error.message : 'Access check failed',
          isAdmin: false,
          isCustomer: false,
        });
      }
    }

    checkAccess();
  }, [searchParams]);

  return state;
}

