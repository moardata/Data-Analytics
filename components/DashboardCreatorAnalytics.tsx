'use client';

import * as React from 'react';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Calendar, Download, RefreshCw } from 'lucide-react';

// New metric components
import ConsistencyScoreGauge from '@/components/metrics/ConsistencyScoreGauge';
import AhaMomentChart from '@/components/metrics/AhaMomentChart';
import PathwayTable from '@/components/metrics/PathwayTable';
import PopularContentList from '@/components/metrics/PopularContentList';
import FeedbackThemesList from '@/components/metrics/FeedbackThemesList';
import CommitmentDistribution from '@/components/metrics/CommitmentDistribution';

/**
 * ADVANCED DASHBOARD METRICS
 * ---------------------------------------------------------
 * New comprehensive dashboard with 6 advanced metrics:
 * Row 1: Engagement Consistency, Aha Moment Tracker, Commitment Probability
 * Row 2: Content Heat Map, Popular Content Today, Top Feedback Themes
 * 
 * All metrics are cached and auto-refreshed via cron jobs
 */

// Colors (kept for Panel component styling)
const PANEL_BORDER = '#2A2F36';

function Panel({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <Card
      className={cn(
        'relative rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden',
        'shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]',
        className
      )}
    >
      {/* metallic sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-b from-white/2 via-transparent to-transparent" />
        <div className="absolute -top-1/2 left-1/2 h-[120%] w-[140%] -translate-x-1/2 rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>
      <CardContent className="relative p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}

// ----------------------------------------
// Props
// ----------------------------------------
interface DashboardCreatorAnalyticsProps {
  clientId: string;
  onExportEventsCsv?: () => void;
  onExportSubscriptionsCsv?: () => void;
  onExportPdf?: () => void;
}

interface DashboardMetrics {
  engagementConsistency: any;
  ahaMoments: any;
  contentPathways: any;
  popularContent: any;
  feedbackThemes: any;
  commitmentScores: any;
  metadata: {
    clientId: string;
    generatedAt: string;
    cacheStatus: Record<string, boolean>;
  };
}

// ----------------------------------------
// Toolbar with navigation (uses searchParams)
// ----------------------------------------
function DashboardToolbar({ onExportPdf, onSync }: { onExportPdf?: () => void; onSync?: () => void }) {
  const searchParams = useSearchParams();
  
  // Preserve companyId and experienceId in navigation
  const companyId = searchParams.get('companyId') || searchParams.get('company_id');
  const experienceId = searchParams.get('experienceId') || searchParams.get('experience_id');
  
  // Build query string to preserve in navigation
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.set('companyId', companyId);
  if (experienceId) queryParams.set('experienceId', experienceId);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-lg font-semibold text-[#F8FAFC]">Dashboard</div>
      <div className="ml-auto flex items-center gap-2">
        <Button 
          onClick={onSync}
          className="border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#F8FAFC]"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Sync Data
        </Button>
        <Link href={`/insights${queryString}`}>
          <Button className="border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#F8FAFC]">AI Insights</Button>
        </Link>
        <Link href={`/forms${queryString}`}>
          <Button className="border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#F8FAFC]">Forms</Button>
        </Link>
        <Link href={`/students${queryString}`}>
          <Button className="border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#F8FAFC]">Students</Button>
        </Link>
        <Button 
          onClick={onExportPdf}
          className="border border-[#10B981] bg-[#10B981] hover:bg-[#0E3A2F] text-white"
        >
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------
// Main component
// ----------------------------------------
export default function DashboardCreatorAnalytics({ clientId, onExportEventsCsv, onExportSubscriptionsCsv, onExportPdf }: DashboardCreatorAnalyticsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/metrics?clientId=${clientId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.statusText}`);
        }
        
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchMetrics();
    }
  }, [clientId]);

  const handleRefresh = () => {
    if (clientId) {
      setLoading(true);
      fetch(`/api/dashboard/metrics?clientId=${clientId}`)
        .then(res => res.json())
        .then(data => {
          setMetrics(data);
          setError(null);
        })
        .catch(err => {
          console.error('Error refreshing metrics:', err);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Suspense fallback={
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-lg font-semibold text-white">Dashboard</div>
          </div>
        }>
          <DashboardToolbar onExportPdf={onExportPdf} />
        </Suspense>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Panel key={i}>
              <div className="animate-pulse">
                <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-700 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-zinc-700 rounded"></div>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Suspense fallback={
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-lg font-semibold text-white">Dashboard</div>
          </div>
        }>
          <DashboardToolbar onExportPdf={onExportPdf} />
        </Suspense>
        
        <Panel>
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">Error loading dashboard</div>
            <div className="text-sm text-zinc-400 mb-4">{error}</div>
            <Button onClick={handleRefresh} className="bg-emerald-600 hover:bg-emerald-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-4">
        <Suspense fallback={
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-lg font-semibold text-white">Dashboard</div>
          </div>
        }>
          <DashboardToolbar onExportPdf={onExportPdf} />
        </Suspense>
        
        <Panel>
          <div className="text-center py-8">
            <div className="text-zinc-400 mb-2">No metrics data available</div>
            <div className="text-sm text-zinc-500">Start collecting data to see your dashboard</div>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Suspense fallback={
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-lg font-semibold text-white">Dashboard</div>
        </div>
      }>
        <DashboardToolbar onExportPdf={onExportPdf} />
      </Suspense>

      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Row 1: Engagement Intelligence */}
        <ConsistencyScoreGauge data={metrics.engagementConsistency} />
        <AhaMomentChart data={metrics.ahaMoments} />
        <CommitmentDistribution data={metrics.commitmentScores} />

        {/* Row 2: Content Intelligence */}
        <PathwayTable data={metrics.contentPathways} />
        <PopularContentList data={metrics.popularContent} />
        <FeedbackThemesList data={metrics.feedbackThemes} />
      </div>

      {/* Footer: System Health + Exports */}
      <Panel>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="text-[13px] text-zinc-400">System Health</div>
            <div className="flex flex-wrap gap-2 text-sm">
              <BadgeComponent label={`Cache Status: ${Object.values(metrics.metadata.cacheStatus).filter(Boolean).length}/6`} />
              <BadgeComponent label={`Last Updated: ${new Date(metrics.metadata.generatedAt).toLocaleTimeString()}`} />
              <BadgeComponent label={`Client: ${metrics.metadata.clientId.slice(0, 8)}...`} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onExportEventsCsv}
              className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60"
            >
              Events CSV
            </Button>
            <Button 
              onClick={onExportSubscriptionsCsv}
              className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60"
            >
              Subscriptions CSV
            </Button>
            <Button 
              onClick={onExportPdf}
              className="border border-emerald-700/60 bg-emerald-900/40 hover:bg-emerald-900/60"
            >
              PDF Report
            </Button>
            <Button 
              onClick={handleRefresh}
              className="border border-zinc-700/60 bg-zinc-900/40 hover:bg-zinc-900/60"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function BadgeComponent({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-emerald-700/40 bg-emerald-900/20 px-2 py-1 text-[12px] text-emerald-300">
      {label}
    </span>
  );
}
