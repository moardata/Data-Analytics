import { useState, useEffect } from 'react';

interface CompanyContext {
  companyId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get the current company context from Whop
 * This automatically detects which company the user is accessing the app from
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
        
        // Get company ID from URL parameters (set by Whop)
        const urlParams = new URLSearchParams(window.location.search);
        const urlCompanyId = urlParams.get('companyId');
        
        if (urlCompanyId) {
          setCompanyId(urlCompanyId);
          return;
        }

        // Try to get company ID from Whop's iframe context
        try {
          // Check if we're in a Whop iframe
          if (window.parent !== window) {
            // Try to access Whop's context
            const whopContext = (window as any).whop;
            if (whopContext && whopContext.companyId) {
              setCompanyId(whopContext.companyId);
              return;
            }
          }
        } catch (whopError) {
          console.log('Whop context not available:', whopError);
        }

        // Try to get from referer URL
        const referer = document.referrer;
        if (referer) {
          try {
            const refererUrl = new URL(referer);
            const refererCompanyId = refererUrl.searchParams.get('companyId') || 
                                   refererUrl.pathname.match(/\/company\/([^\/]+)/)?.[1];
            
            if (refererCompanyId) {
              setCompanyId(refererCompanyId);
              return;
            }
          } catch (refererError) {
            console.log('Referer parsing failed:', refererError);
          }
        }

        // For testing, try to get from localStorage or use a fallback
        const testCompanyId = localStorage.getItem('testCompanyId') || 'test_company';
        
        // Only use test company ID if we're in development or if no other method worked
        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
          setCompanyId(testCompanyId);
          return;
        }

        // If we're in production but still can't find company context, show a helpful error with instructions
        setError('No company context found. Please ensure you are accessing this app through Whop with a valid company ID. For testing, you can add ?companyId=your_company_id to the URL.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get company context');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyContext();
  }, []);

  return { companyId, loading, error };
}
