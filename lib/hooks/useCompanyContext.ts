'use client';

import { useState, useEffect } from 'react';

interface CompanyContext {
  companyId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get the current company context from Whop
 * 
 * When a Whop app is embedded, the company ID is automatically provided via:
 * 1. URL parameter: ?companyId=biz_xxxxx
 * 2. Headers (for server-side requests)
 * 
 * For proper setup in Whop:
 * - Set your app URL to: https://your-app.com?companyId={{COMPANY_ID}}
 * - Whop will automatically replace {{COMPANY_ID}} with the actual company ID
 */
export function useCompanyContext(): CompanyContext {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanyContext() {
      try {
        setLoading(true);
        setError(null);
        
        // Method 1: Get from URL parameters (Whop automatically injects this)
        const urlParams = new URLSearchParams(window.location.search);
        const urlCompanyId = urlParams.get('companyId') || urlParams.get('company_id');
        
        if (urlCompanyId) {
          console.log('✅ Company ID found in URL:', urlCompanyId);
          setCompanyId(urlCompanyId);
          setLoading(false);
          return;
        }

        // Method 2: Check if we're in an iframe and try to get from window context
        if (window.self !== window.top) {
          // We're in an iframe - wait a bit for Whop to inject context
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try to access Whop SDK context from window
          const whopContext = (window as any).WhopSdk || (window as any).whop;
          if (whopContext?.companyId) {
            console.log('✅ Company ID found in Whop SDK context:', whopContext.companyId);
            setCompanyId(whopContext.companyId);
            setLoading(false);
            return;
          }

          // Try to get from URL again after wait (in case URL updated)
          const retryUrlParams = new URLSearchParams(window.location.search);
          const retryCompanyId = retryUrlParams.get('companyId') || retryUrlParams.get('company_id');
          
          if (retryCompanyId) {
            console.log('✅ Company ID found in URL (retry):', retryCompanyId);
            setCompanyId(retryCompanyId);
            setLoading(false);
            return;
          }
        }

        // Method 3: Try to get from our backend API
        try {
          const response = await fetch('/api/whop/context');
          const data = await response.json();
          
          if (data.success && data.companyId && data.companyId !== 'test_company') {
            console.log('✅ Company ID found from API:', data.companyId);
            setCompanyId(data.companyId);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('⚠️ Could not fetch company ID from API:', apiError);
        }

        // Method 4: Development fallback
        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
          const devCompanyId = localStorage.getItem('devCompanyId') || 'test_company';
          console.log('⚠️ Development mode: using fallback company ID:', devCompanyId);
          setCompanyId(devCompanyId);
          setLoading(false);
          return;
        }

        // If we get here, no company ID was found
        console.error('❌ No company ID found');
        setError(
          'No company context found. Please ensure your Whop app URL is configured correctly. ' +
          'The URL should be: https://your-app.vercel.app?companyId={{COMPANY_ID}} ' +
          'For testing, you can manually add ?companyId=your_company_id to the URL.'
        );
        setLoading(false);
      } catch (err) {
        console.error('❌ Error getting company context:', err);
        setError(err instanceof Error ? err.message : 'Failed to get company context');
        setLoading(false);
      }
    }

    fetchCompanyContext();
  }, []);

  return { companyId, loading, error };
}