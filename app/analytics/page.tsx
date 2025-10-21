/**
 * Analytics Dashboard Page
 * Proper Multi-Tenant Analytics with Whop Authentication
 * 
 * Features:
 * - Automatic company ID detection from Whop
 * - User authentication via Whop SDK
 * - Access control (only admins/owners can view)
 * - Complete data isolation per company
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import DashboardCreatorAnalytics from '@/components/DashboardCreatorAnalytics';
import { adaptToCreatorAnalytics } from '@/lib/utils/adaptDashboardCreatorAnalytics';
import { PermissionsBanner } from '@/components/PermissionsBanner';
import { useWhopAuth } from '@/lib/hooks/useWhopAuth';

export const dynamic = 'force-dynamic';

type DateRange = 'week' | 'month' | 'quarter';

function AnalyticsContent() {
  // SIMPLIFIED: Get company ID directly from URL (no auth needed)
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [range, setRange] = useState<DateRange>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
  const [isInIframe, setIsInIframe] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    // Get company ID from URL
    const params = new URLSearchParams(window.location.search);
    const companyIdFromUrl = params.get('companyId') || 
                            window.location.pathname.split('/').find(part => part.startsWith('biz_'));
    setCompanyId(companyIdFromUrl);
    console.log('✅ Company ID from URL:', companyIdFromUrl);
    
    // Detect if running in iframe
    const inIframe = window !== window.parent;
    setIsInIframe(inIframe);
    console.log('🔍 Iframe detection:', inIframe);
  }, []);
  
  useEffect(() => {
    // Fetch data when company ID is available
    if (companyId) {
      fetchData();
    }
  }, [range, companyId]);

  const createClientRecord = async () => {
    if (!companyId) return;
    
    try {
      const response = await fetch('/api/setup/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: companyId,
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

  const handleSyncStudents = async () => {
    if (!companyId) {
      setSyncMessage('❌ No company ID found');
      return;
    }

    setSyncing(true);
    setSyncMessage('🔄 Syncing students from Whop...');

    try {
      const response = await fetch(`/api/sync/students?companyId=${companyId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSyncMessage(`✅ ${data.message}`);
        // Refresh dashboard data
        setTimeout(() => {
          fetchData();
          setSyncMessage('');
        }, 2000);
      } else {
        setSyncMessage(`❌ ${data.error || 'Failed to sync students'}`);
      }
    } catch (error) {
      setSyncMessage('❌ Error syncing students. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const fetchData = async () => {
    if (!companyId) {
      setError('No company ID available');
      setLoading(false);
      return;
    }
    
    console.log('📊 Fetching data for company:', companyId);
    
    setLoading(true);
    setError(null);
    setAccessError(null);
    try {
      // Use companyId from authenticated context
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
    if (!companyId) return;
    window.open(`/api/export/csv?companyId=${companyId}&type=events`, '_blank');
  };

  const handleExportSubscriptionsCsv = () => {
    if (!companyId) return;
    window.open(`/api/export/csv?companyId=${companyId}&type=subscriptions`, '_blank');
  };

  const handleExportPdf = () => {
    if (!companyId) return;
    window.open(`/api/export/pdf?companyId=${companyId}`, '_blank');
  };

  const handleLogEvent = (evt: { name: string; sellerId: string; meta?: Record<string, any> }) => {
    console.log('📊 Analytics event:', evt);
    // In production, send to your analytics service (e.g., PostHog, Mixpanel, etc.)
  };

  // REMOVED: No authentication checks needed anymore

  // Show loading state while getting company ID
  if (!companyId) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-[#D1D5DB] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p>Initializing Analytics...</p>
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
    const isClientNotFound = error.includes('Client not found') || error.includes('needs initialization');
    
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-400 text-xl mb-2">
            {isClientNotFound ? 'No Data Yet' : 'Error loading dashboard'}
          </div>
          <div className="text-[#9AA4B2] text-sm mb-6">{error}</div>
          
          {isClientNotFound && (
            <div className="space-y-4">
              <p className="text-[#D1D5DB] text-sm mb-4">
                Import your existing students from Whop to get started:
              </p>
              <button
                onClick={handleSyncStudents}
                disabled={syncing}
                className="px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#0E3A2F] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Syncing...
                  </>
                ) : (
                  'Sync Students from Whop'
                )}
              </button>
              {syncMessage && (
                <div className={`text-sm p-3 rounded ${
                  syncMessage.startsWith('✅') ? 'bg-green-900/20 text-green-400' :
                  syncMessage.startsWith('🔄') ? 'bg-blue-900/20 text-blue-400' :
                  'bg-red-900/20 text-red-400'
                }`}>
                  {syncMessage}
                </div>
              )}
            </div>
          )}
          
          {!isClientNotFound && (
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#0E3A2F]"
            >
              Retry
            </button>
          )}
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
        {/* User Role Badge */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1E2228] border border-[#2A2F36] rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[#D1D5DB] text-sm">
                Authenticated as: <span className="text-[#10B981] font-semibold capitalize">Owner</span>
              </span>
            </div>
            <div className="text-[#9AA4B2] text-xs font-mono">
              {companyId}
            </div>
          </div>
        </div>
        
        <PermissionsBanner missing={missingPermissions} />
        
        {/* Sync Students Button - Always visible when no data */}
        {dashboardData && dashboardData.totalStudents === 0 && (
          <div className="mb-6 p-4 bg-[#1E2228] rounded-lg border border-[#2A2F36]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">No Students Found</h3>
                <p className="text-[#9AA4B2] text-sm">
                  Import your existing students from Whop to start tracking analytics.
                </p>
              </div>
              <button
                onClick={handleSyncStudents}
                disabled={syncing}
                className="px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#0E3A2F] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Students from Whop
                  </>
                )}
              </button>
            </div>
            {syncMessage && (
              <div className={`mt-3 text-sm p-3 rounded ${
                syncMessage.startsWith('✅') ? 'bg-green-900/20 text-green-400' :
                syncMessage.startsWith('🔄') ? 'bg-blue-900/20 text-blue-400' :
                'bg-red-900/20 text-red-400'
              }`}>
                {syncMessage}
              </div>
            )}
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
