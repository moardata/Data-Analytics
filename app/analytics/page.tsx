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

export const dynamic = 'force-dynamic';

type DateRange = 'week' | 'month' | 'quarter';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
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
    
    // For development: if no companyId, use a default one
    if (!companyId && process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using default companyId');
    }
    
    fetchData();
  }, [range, companyId]);

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
    console.log('🚀 Starting fetchData with companyId:', companyId, 'range:', range);
    console.log('🚀 Is in iframe:', isInIframe);
    setLoading(true);
    setError(null);
    setAccessError(null);
    try {
      // Use companyId from URL (passed from Whop)
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
          if (isInIframe) {
            setAccessError('Whop authentication failed. Please ensure you are accessing this app through the Whop platform.');
          } else {
            setAccessError('You do not have permission to view analytics. Only company admins can access this dashboard.');
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
      console.error('❌ ERROR fetching dashboard data:', err);
      console.error('❌ Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        type: typeof err,
        isInIframe,
        userAgent: navigator.userAgent
      });
      
      // Provide iframe-specific error messages
      const errorMessage = isInIframe 
        ? 'Dashboard failed to load in iframe. This may be due to CORS or authentication issues. Please check the console for details.'
        : err instanceof Error ? err.message : 'Failed to load dashboard';
        
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
        
        {/* Status indicators */}
        {isInIframe && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <div className="text-blue-300 text-sm">
              🔗 Running in iframe (Whop context detected)
            </div>
          </div>
        )}
        
        {process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
            <div className="text-yellow-300 text-sm">
              🔧 Auth bypass mode (Whop auth disabled)
            </div>
          </div>
        )}
        
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
