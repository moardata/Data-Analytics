/**
 * Analytics Dashboard Page
 * Uses the Dark Emerald dashboard theme
 * Admin-only access with proper Whop SDK validation
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardCreatorAnalytics from '@/components/DashboardCreatorAnalytics';
import { adaptToCreatorAnalytics } from '@/lib/utils/adaptDashboardCreatorAnalytics';
import { PermissionsBanner } from '@/components/PermissionsBanner';
import { useCompanyContext } from '@/lib/hooks/useCompanyContext';

export const dynamic = 'force-dynamic';

type DateRange = 'week' | 'month' | 'quarter';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const { companyId, loading: companyLoading, error: companyError } = useCompanyContext();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [range, setRange] = useState<DateRange>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Detect if running in iframe
    const inIframe = window !== window.parent;
    setIsInIframe(inIframe);
    console.log('🔍 Iframe detection:', inIframe);
    
    // Only fetch data if we have a companyId and it's not loading
    if (companyId && !companyLoading) {
      fetchData();
    }
  }, [range, companyId, companyLoading]);

  const createClientRecord = async () => {
    try {
      const response = await fetch('/api/setup/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          companyName: `Company ${companyId}`,
          companyEmail: `company@${companyId}.com`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create client record');
      }

      // Retry fetching data after creating client
      await fetchData();
    } catch (err) {
      console.error('Error creating client record:', err);
      setError('Failed to initialize dashboard. Please refresh the page.');
    }
  };

  const fetchData = async () => {
    if (!companyId) {
      setError('No company context found. Please ensure you are accessing this app through Whop.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setAccessError(null);
    try {
      // Use companyId from company context
      const apiUrl = `/api/analytics/metrics?companyId=${companyId}&timeRange=${range}`;
      
      // Add iframe-specific headers if needed
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add credentials for iframe context
        credentials: isInIframe ? 'include' : 'same-origin',
      };
      
      const res = await fetch(apiUrl, fetchOptions);
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          const errorData = await res.json().catch(() => ({ error: 'Authentication failed' }));
          
          if (isInIframe) {
            setAccessError('Whop authentication failed. Please ensure you have admin permissions and try refreshing the page.');
          } else {
            setAccessError('Authentication required. Please access this app through the Whop platform.');
          }
          return;
        }
        if (res.status === 404) {
          // No client found - create one automatically
          await createClientRecord();
          return;
        }
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }

      const apiData = await res.json();
      
      // Check for missing permissions in the response
      if (apiData.missingPermissions && Array.isArray(apiData.missingPermissions)) {
        setMissingPermissions(apiData.missingPermissions);
      } else {
        setMissingPermissions([]);
      }
      
      const adapted = adaptToCreatorAnalytics(apiData);
      setDashboardData(adapted);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportEventsCsv = () => {
    window.open(`/api/export/csv?companyId=${companyId}&type=events`, '_blank');
  };

  const handleExportSubscriptionsCsv = () => {
    window.open(`/api/export/csv?companyId=${companyId}&type=subscriptions`, '_blank');
  };

  const handleExportPdf = () => {
    window.open(`/api/export/pdf?companyId=${companyId}`, '_blank');
  };

  const handleLogEvent = (evt: { name: string; sellerId: string; meta?: Record<string, any> }) => {
    console.log('📊 Analytics event:', evt);
    // In production, send to your analytics service (e.g., PostHog, Mixpanel, etc.)
  };

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-[#D1D5DB] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p>Detecting company context...</p>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-400 text-xl mb-2">Company Context Error</div>
          <div className="text-[#9AA4B2] text-sm mb-6">{companyError}</div>
          <div className="text-[#9AA4B2] text-xs">
            Please ensure you are accessing this app through Whop with proper permissions.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-[#D1D5DB] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-400 text-xl mb-2">Access Denied</div>
          <div className="text-[#9AA4B2] text-sm mb-6">{accessError}</div>
          <div className="text-[#9AA4B2] text-xs">
            If you believe this is an error, please contact your company administrator.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">Error loading dashboard</div>
          <div className="text-[#9AA4B2] text-sm mb-4">{error}</div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#0E3A2F]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f1115]">
      <div className="max-w-[1600px] mx-auto p-6">
        <PermissionsBanner missing={missingPermissions} />
        
        <DashboardCreatorAnalytics
          data={dashboardData}
          onExportEventsCsv={handleExportEventsCsv}
          onExportSubscriptionsCsv={handleExportSubscriptionsCsv}
          onExportPdf={handleExportPdf}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
