/**
 * Analytics Dashboard Page
 * Uses the Dark Emerald dashboard theme
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardCreatorAnalytics from '@/components/DashboardCreatorAnalytics';
import { adaptToCreatorAnalytics } from '@/lib/utils/adaptDashboardCreatorAnalytics';

export const dynamic = 'force-dynamic';

type DateRange = 'week' | 'month' | 'quarter';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 'default';
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [range, setRange] = useState<DateRange>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [range, companyId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use companyId from URL (passed from Whop) or fallback to 'default'
      const res = await fetch(`/api/analytics/metrics?clientId=${companyId}&timeRange=${range}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }

      const apiData = await res.json();
      const adapted = adaptToCreatorAnalytics(apiData);
      setDashboardData(adapted);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExportEventsCsv = () => {
    window.open(`/api/export/csv?clientId=${companyId}&type=events`, '_blank');
  };

  const handleExportSubscriptionsCsv = () => {
    window.open(`/api/export/csv?clientId=${companyId}&type=subscriptions`, '_blank');
  };

  const handleExportPdf = () => {
    window.open(`/api/export/pdf?clientId=${companyId}`, '_blank');
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
    <DashboardCreatorAnalytics
      data={dashboardData}
      onExportEventsCsv={handleExportEventsCsv}
      onExportSubscriptionsCsv={handleExportSubscriptionsCsv}
      onExportPdf={handleExportPdf}
    />
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
