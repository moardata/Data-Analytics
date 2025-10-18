'use client';

import { useState, useEffect } from 'react';

interface WhopContext {
  companyId: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Proper Whop Context Hook based on mint-mcp patterns
 * 
 * This hook properly handles:
 * 1. Company ID detection from Whop iframe
 * 2. User authentication context
 * 3. Proper error handling and loading states
 * 
 * Key differences from previous implementation:
 * - Uses proper Whop SDK patterns
 * - Handles iframe context correctly
 * - Provides better error messages
 * - Follows mint-mcp authentication flow
 */
export function useWhopContext(): WhopContext {
  const [context, setContext] = useState<WhopContext>({
    companyId: null,
    userId: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  useEffect(() => {
    async function detectWhopContext() {
      try {
        setContext(prev => ({ ...prev, loading: true, error: null }));

        // Method 1: Check URL parameters (Whop injects these when embedding)
        const urlParams = new URLSearchParams(window.location.search);
        const urlCompanyId = urlParams.get('companyId') || urlParams.get('company_id');
        const urlUserId = urlParams.get('userId') || urlParams.get('user_id');

        if (urlCompanyId) {
          console.log('✅ Company ID from URL:', urlCompanyId);
          setContext({
            companyId: urlCompanyId,
            userId: urlUserId,
            loading: false,
            error: null,
            isAuthenticated: true
          });
          return;
        }

        // Method 2: Check if we're in a Whop iframe and wait for context
        if (window.self !== window.top) {
          console.log('🔍 Detected Whop iframe context');
          
          // Wait for Whop to inject context
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check URL again after delay (Whop might inject it)
          const retryParams = new URLSearchParams(window.location.search);
          const retryCompanyId = retryParams.get('companyId') || retryParams.get('company_id');
          
          if (retryCompanyId) {
            console.log('✅ Company ID from URL (retry):', retryCompanyId);
            setContext({
              companyId: retryCompanyId,
              userId: retryParams.get('userId') || retryParams.get('user_id'),
              loading: false,
              error: null,
              isAuthenticated: true
            });
            return;
          }

          // Method 3: Try to get context from Whop SDK
          try {
            const response = await fetch('/api/whop/context');
            const data = await response.json();
            
            if (data.success && data.companyId) {
              console.log('✅ Company ID from API:', data.companyId);
              setContext({
                companyId: data.companyId,
                userId: data.userId,
                loading: false,
                error: null,
                isAuthenticated: true
              });
              return;
            }
          } catch (apiError) {
            console.log('⚠️ API context fetch failed:', apiError);
          }
        }

        // Method 4: Development/testing fallback
        if (process.env.NODE_ENV === 'development' || 
            window.location.hostname === 'localhost' ||
            window.location.hostname.includes('vercel.app')) {
          
          const testCompanyId = 'biz_3GYHNPbGkZCEky'; // Your actual company ID
          console.log('⚠️ Development mode: using test company ID:', testCompanyId);
          
          setContext({
            companyId: testCompanyId,
            userId: 'test_user',
            loading: false,
            error: null,
            isAuthenticated: true
          });
          return;
        }

        // If we get here, no context was found
        setContext({
          companyId: null,
          userId: null,
          loading: false,
          error: 'No Whop context found. Please ensure you are accessing this app through Whop.',
          isAuthenticated: false
        });

      } catch (error) {
        console.error('❌ Error detecting Whop context:', error);
        setContext({
          companyId: null,
          userId: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to detect Whop context',
          isAuthenticated: false
        });
      }
    }

    detectWhopContext();
  }, []);

  return context;
}
