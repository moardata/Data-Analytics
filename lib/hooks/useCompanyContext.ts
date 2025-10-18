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
        } else {
          setError('No company context found. Please ensure you are accessing this app through Whop with a valid company ID.');
        }
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
