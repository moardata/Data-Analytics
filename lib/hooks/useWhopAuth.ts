'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export interface WhopAuthState {
  // Authentication
  userId: string | null;
  isAuthenticated: boolean;
  
  // Company Context
  companyId: string | null;
  hasCompanyAccess: boolean;
  accessLevel: 'owner' | 'admin' | 'member' | 'none';
  
  // Status
  loading: boolean;
  error: string | null;
  
  // User Info
  isAdmin: boolean;
  isOwner: boolean;
}

/**
 * Proper Whop Multi-Tenant Authentication Hook
 * 
 * This hook implements complete multi-tenancy:
 * 1. Gets company ID from URL (Whop injects via ?companyId={{COMPANY_ID}})
 * 2. Verifies user authentication via backend
 * 3. Checks if user has access to that specific company
 * 4. Only grants access if user belongs to the company
 * 
 * Usage:
 *   const auth = useWhopAuth();
 *   
 *   if (auth.loading) return <Loading />;
 *   if (!auth.hasCompanyAccess) return <AccessDenied />;
 *   
 *   // User is authenticated and has access to this company
 *   return <Dashboard companyId={auth.companyId} />;
 */
export function useWhopAuth(): WhopAuthState {
  const searchParams = useSearchParams();
  
  const [state, setState] = useState<WhopAuthState>({
    userId: null,
    isAuthenticated: false,
    companyId: null,
    hasCompanyAccess: false,
    accessLevel: 'none',
    loading: true,
    error: null,
    isAdmin: false,
    isOwner: false,
  });

  useEffect(() => {
    async function authenticate() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Step 1: Get company ID from URL (Whop automatically injects this)
        const urlCompanyId = searchParams.get('companyId') || searchParams.get('company_id');
        
        if (!urlCompanyId) {
          // No company ID in URL - this means:
          // 1. App is not being accessed through Whop
          // 2. Whop app URL is not configured correctly
          
          // Check if we're in development
          const isDev = window.location.hostname === 'localhost' || 
                       window.location.hostname.includes('127.0.0.1');
          
          if (isDev) {
            // Development mode: use fallback for testing
            const fallbackCompanyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 'biz_3GYHNPbGkZCEky';
            console.log('⚠️ DEV MODE: Using fallback company ID:', fallbackCompanyId);
            
            setState({
              userId: 'dev_user',
              isAuthenticated: true,
              companyId: fallbackCompanyId,
              hasCompanyAccess: true,
              accessLevel: 'admin',
              loading: false,
              error: null,
              isAdmin: true,
              isOwner: true,
            });
            return;
          }
          
          // Production: require company ID from Whop
          setState({
            userId: null,
            isAuthenticated: false,
            companyId: null,
            hasCompanyAccess: false,
            accessLevel: 'none',
            loading: false,
            error: 'No company context found. Please ensure you are accessing this app through Whop with a valid company ID. For testing, you can add ?companyId=your_company_id to the URL.',
            isAdmin: false,
            isOwner: false,
          });
          return;
        }

        console.log('✅ Company ID from URL:', urlCompanyId);

        // Step 2: Verify authentication and access with backend
        const response = await fetch('/api/auth/permissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyId: urlCompanyId })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }));
          
          setState({
            userId: null,
            isAuthenticated: false,
            companyId: urlCompanyId,
            hasCompanyAccess: false,
            accessLevel: 'none',
            loading: false,
            error: errorData.error || `Authentication failed (${response.status})`,
            isAdmin: false,
            isOwner: false,
          });
          return;
        }

        const data = await response.json();

        if (!data.success || !data.permissions.isAuthorized) {
          setState({
            userId: data.permissions.userId || null,
            isAuthenticated: !!data.permissions.userId,
            companyId: urlCompanyId,
            hasCompanyAccess: false,
            accessLevel: 'none',
            loading: false,
            error: data.error || 'Access denied. Only company owners and administrators can access analytics.',
            isAdmin: false,
            isOwner: false,
          });
          return;
        }

        // Step 3: User is authenticated and has access!
        const isOwner = data.permissions.userRole === 'owner';
        const isAdmin = data.permissions.userRole === 'admin' || isOwner;
        
        setState({
          userId: data.permissions.userId,
          isAuthenticated: true,
          companyId: urlCompanyId,
          hasCompanyAccess: true,
          accessLevel: data.permissions.userRole || 'member',
          loading: false,
          error: null,
          isAdmin,
          isOwner,
        });

      } catch (error) {
        console.error('❌ Whop authentication error:', error);
        
        setState({
          userId: null,
          isAuthenticated: false,
          companyId: null,
          hasCompanyAccess: false,
          accessLevel: 'none',
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to authenticate',
          isAdmin: false,
          isOwner: false,
        });
      }
    }

    authenticate();
  }, [searchParams]);

  return state;
}

