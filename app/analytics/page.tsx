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
import { useWhopExperience } from '@/lib/hooks/useWhopExperience';

export const dynamic = 'force-dynamic';

type DateRange = 'week' | 'month' | 'quarter';

function AnalyticsContent() {
  // Use NEW experience-based authentication
  const auth = useWhopExperience();
  
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
    // Detect if running in iframe
    const inIframe = window !== window.parent;
    setIsInIframe(inIframe);
    console.log('🔍 Iframe detection:', inIframe);
    
    // Only fetch data if user has access and experience ID is present
    if (auth.hasAccess && auth.experienceId && !auth.loading) {
      fetchData();
    }
  }, [range, auth.hasAccess, auth.experienceId, auth.loading]);

  const createClientRecord = async () => {
    if (!auth.companyId || !auth.experienceId) return;
    
    try {
      const response = await fetch('/api/setup/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: auth.companyId,
          companyName: `Company ${auth.companyId}`,
          companyEmail: `company@${auth.companyId}.com`,
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
    if (!auth.companyId) {
      setSyncMessage('❌ No company ID found');
      return;
    }

    setSyncing(true);
    setSyncMessage('🔄 Syncing students from Whop...');

    try {
      const response = await fetch(`/api/sync/students?companyId=${auth.companyId}`, {
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
    if (!auth.companyId) {
      setError('No company ID available');
      setLoading(false);
      return;
    }
    
    console.log('📊 Fetching data for company:', auth.companyId);
    
    setLoading(true);
    setError(null);
    setAccessError(null);
    try {
      // Use companyId from authenticated context
      const apiUrl = `/api/analytics/metrics?companyId=${auth.companyId}&timeRange=${range}`;
      
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
    if (!auth.companyId) return;
    window.open(`/api/export/csv?companyId=${auth.companyId}&type=events`, '_blank');
  };

  const handleExportSubscriptionsCsv = () => {
    if (!auth.companyId) return;
    window.open(`/api/export/csv?companyId=${auth.companyId}&type=subscriptions`, '_blank');
  };

  const handleExportPdf = () => {
    if (!auth.companyId) return;
    window.open(`/api/export/pdf?companyId=${auth.companyId}`, '_blank');
  };

  const handleLogEvent = (evt: { name: string; sellerId: string; meta?: Record<string, any> }) => {
    console.log('📊 Analytics event:', evt);
    // In production, send to your analytics service (e.g., PostHog, Mixpanel, etc.)
  };

  // Show authentication loading state
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-[#D1D5DB] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p>Authenticating with Whop...</p>
          <p className="text-sm text-[#9AA4B2] mt-2">Verifying your access...</p>
        </div>
      </div>
    );
  }

  // Show authentication error
  if (auth.error || !auth.hasAccess) {
    const isTestingMode = auth.error?.includes('experience ID');
    const currentUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
    const testUrl = `${currentUrl}?experienceId=exp_test`;
    
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="mb-6">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <div className="text-red-400 text-xl font-semibold mb-3">
            Access Through Whop Required
          </div>
          
          <div className="text-[#9AA4B2] text-sm mb-6">
            {auth.error || 'This app must be accessed through the Whop platform.'}
          </div>
          
          <div className="bg-[#1E2228] border border-[#2A2F36] rounded-lg p-6 mb-6 text-left">
            <div className="text-[#D1D5DB] text-sm font-medium mb-4">📋 To use this app:</div>
            <ul className="text-[#9AA4B2] text-xs space-y-2">
              <li>1. Install this app from the Whop App Store</li>
              <li>2. Add it to one of your products</li>
              <li>3. Open the app from your Whop dashboard</li>
            </ul>
          </div>
          
          <div className="bg-[#1E2228] border border-[#10B981]/30 rounded-lg p-4">
            <div className="text-[#10B981] text-sm font-medium mb-2">🛠️ For Developers:</div>
            <div className="text-[#9AA4B2] text-xs">
              Run: <code className="bg-black/30 px-2 py-1 rounded text-[#10B981]">npm run dev:whop</code>
              <br />
              Then switch to Localhost mode in Whop settings.
            </div>
          </div>
          
          {isTestingMode ? (
            <div className="bg-[#1E2228] border border-[#2A2F36] rounded-lg p-6 mb-6 text-left">
              <div className="text-[#D1D5DB] text-sm font-medium mb-4">🧪 To test your app:</div>
              
              <div className="mb-4">
                <div className="text-[#9AA4B2] text-xs mb-2">Click this URL to test:</div>
                <a 
                  href={testUrl}
                  className="block bg-[#10B981]/10 border border-[#10B981]/30 rounded p-3 text-[#10B981] text-xs font-mono hover:bg-[#10B981]/20 transition-colors break-all"
                >
                  {testUrl}
                </a>
              </div>

              <div className="border-t border-[#2A2F36] pt-4 mt-4">
                <div className="text-[#9AA4B2] text-xs mb-2">Or copy this URL format:</div>
                <div className="bg-black/30 rounded p-3 text-[#10B981] text-xs font-mono break-all">
                  {currentUrl}?companyId=YOUR_COMPANY_ID
                </div>
              </div>

              <div className="border-t border-[#2A2F36] pt-4 mt-4">
                <div className="text-[#9AA4B2] text-xs mb-2">Your company ID is in Whop dashboard:</div>
                <div className="text-[#10B981] text-xs">
                  Go to your Whop company → Settings → Copy company ID (starts with "biz_")
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1E2228] border border-[#2A2F36] rounded-lg p-4 mb-6">
              <div className="text-[#D1D5DB] text-sm font-medium mb-2">Requirements:</div>
              <ul className="text-[#9AA4B2] text-xs space-y-1 text-left">
                <li>✓ Must be accessed through Whop</li>
                <li>✓ Must have admin or owner role</li>
                <li>✓ Must belong to the company</li>
              </ul>
            </div>
          )}
          
          {auth.companyId && !isTestingMode && (
            <div className="text-[#9AA4B2] text-xs mb-4">
              Company ID: <span className="text-[#10B981] font-mono">{auth.companyId}</span>
            </div>
          )}
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
                Authenticated as: <span className="text-[#10B981] font-semibold capitalize">{auth.accessLevel}</span>
              </span>
            </div>
            <div className="text-[#9AA4B2] text-xs font-mono">
              {auth.companyId}
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
