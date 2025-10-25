'use client';

import * as React from 'react';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { Info, Users, Target, TrendingUp, RefreshCw, Lock, Zap } from 'lucide-react';
import { canAccessMetric, type TierName } from '@/lib/pricing/tiers';

// New metric components
import ConsistencyScoreGauge from '@/components/metrics/ConsistencyScoreGauge';
import AhaMomentChart from '@/components/metrics/AhaMomentChart';
import PathwayTable from '@/components/metrics/PathwayTable';
import PopularContentList from '@/components/metrics/PopularContentList';
import FeedbackThemesList from '@/components/metrics/FeedbackThemesList';
import CommitmentDistribution from '@/components/metrics/CommitmentDistribution';
import LockedMetricCard from '@/components/metrics/LockedMetricCard';

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
// Toolbar with info button only
// ----------------------------------------
function DashboardToolbar() {
  const [showInfo, setShowInfo] = React.useState(false);
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-lg font-semibold text-[#F8FAFC]">Dashboard</div>
      <div className="ml-auto flex items-center gap-2">
        <Button 
          onClick={() => setShowInfo(!showInfo)}
          className="border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#F8FAFC]"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
      
      {showInfo && (
        <div className="w-full mt-2 p-4 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a]">
          <h4 className="text-sm font-semibold text-[#F8FAFC] mb-2">Dashboard Information</h4>
          <p className="text-xs text-[#A1A1AA]">
            Track your student engagement, success metrics, and content performance. 
            Use the tabs to explore different aspects of your student data and discover actionable insights.
          </p>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------
// Main component
// ----------------------------------------
export default function DashboardCreatorAnalytics({ clientId: companyIdOrClientId, onExportEventsCsv, onExportSubscriptionsCsv, onExportPdf }: DashboardCreatorAnalyticsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [actualClientId, setActualClientId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7D');
  const [activeTab, setActiveTab] = useState<string>('engagement');
  const [userTier, setUserTier] = useState<TierName>('starter');

  // Fetch user tier
  useEffect(() => {
    const fetchTier = async () => {
      if (!companyIdOrClientId) return;
      try {
        const res = await fetch(`/api/usage/check?companyId=${companyIdOrClientId}`);
        const data = await res.json();
        setUserTier(data.tier || 'starter');
      } catch (err) {
        console.error('Error fetching tier:', err);
      }
    };
    fetchTier();
  }, [companyIdOrClientId]);

  // Convert companyId to UUID clientId if needed
  useEffect(() => {
    const fetchClientId = async () => {
      if (!companyIdOrClientId) return;
      
      // If it's already a UUID (contains dashes), use it directly
      if (companyIdOrClientId.includes('-')) {
        setActualClientId(companyIdOrClientId);
        return;
      }
      
      // Otherwise, it's a companyId (like biz_xxx), look up the UUID
      try {
        console.log('🔍 Looking up client UUID for company:', companyIdOrClientId);
        const response = await fetch(`/api/client/lookup?companyId=${companyIdOrClientId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Found client UUID:', data.clientId);
          setActualClientId(data.clientId);
        } else {
          console.error('❌ Failed to lookup client ID');
          // Fallback: try using the companyId directly
          setActualClientId(companyIdOrClientId);
        }
      } catch (err) {
        console.error('Error looking up client ID:', err);
        // Fallback: try using the companyId directly
        setActualClientId(companyIdOrClientId);
      }
    };
    
    fetchClientId();
  }, [companyIdOrClientId]);

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!actualClientId) return;
      
      try {
        setLoading(true);
        console.log('📊 Fetching metrics for client:', actualClientId, 'with time range:', timeRange);
        const response = await fetch(`/api/dashboard/metrics?clientId=${actualClientId}&timeRange=${timeRange}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', response.status, errorText);
          throw new Error(`Failed to fetch metrics: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Metrics loaded successfully for time range:', timeRange);
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    if (actualClientId) {
      fetchMetrics();
    }
  }, [actualClientId, timeRange]);

  const handleRefresh = () => {
    if (actualClientId) {
      setLoading(true);
      fetch(`/api/dashboard/metrics?clientId=${actualClientId}&timeRange=${timeRange}`)
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

  const handleSync = async () => {
    if (!actualClientId) {
      console.error('❌ No clientId provided for sync');
      return;
    }
    
    try {
      setSyncing(true);
      setError(null);
      console.log('🔄 Starting metrics sync for client:', actualClientId);
      
      const response = await fetch(`/api/dashboard/metrics?clientId=${actualClientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Sync response error:', response.status, errorText);
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Metrics sync completed successfully:', data.metadata);
      setMetrics(data);
      setError(null);
      
      // Optional: Show success toast/notification
      console.log('📊 Dashboard metrics refreshed at:', data.metadata.generatedAt);
    } catch (err) {
      console.error('❌ Error syncing metrics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync metrics';
      setError(errorMessage);
      
      // Keep existing metrics if sync fails
      console.warn('⚠️  Keeping existing metrics after sync failure');
    } finally {
      setSyncing(false);
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
          <DashboardToolbar />
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
          <DashboardToolbar />
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
          <DashboardToolbar />
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
    <div className="space-y-6">
      {/* Toolbar */}
      <Suspense fallback={
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-lg font-semibold text-white">Dashboard</div>
        </div>
      }>
        <DashboardToolbar />
      </Suspense>

      {/* Welcome Section */}
      <div className="rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-6">
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Your Student Insights at a Glance</h2>
        <p className="text-[#A1A1AA] text-sm">
          Track how your students engage, discover what content works best, and identify who needs support
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F8FAFC]">{metrics.commitmentScores.totalStudents}</p>
              <p className="text-xs text-[#A1A1AA]">Total Students</p>
            </div>
          </div>
        </Card>
        <Card className="border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F8FAFC]">{metrics.engagementConsistency.averageScore.toFixed(1)}</p>
              <p className="text-xs text-[#A1A1AA]">Avg Consistency</p>
            </div>
          </div>
        </Card>
        <Card className="border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F8FAFC]">{metrics.popularContent.totalEngagements}</p>
              <p className="text-xs text-[#A1A1AA]">Engagements Today</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-[#0f0f0f] border border-[#1a1a1a]">
          <TabsTrigger value="engagement" className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
            <Users className="h-4 w-4 mr-2" />
            Student Engagement
          </TabsTrigger>
          <TabsTrigger value="commitment" className="data-[state=active]:bg-[#F59E0B] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(245,158,11,0.6)]">
            <Target className="h-4 w-4 mr-2" />
            Student Success
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(59,130,246,0.6)]">
            <TrendingUp className="h-4 w-4 mr-2" />
            Content Performance
          </TabsTrigger>
        </TabsList>

        {/* Student Engagement Tab */}
        <TabsContent value="engagement" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-6">
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">📊 Understanding Your Students</h3>
            <p className="text-[#A1A1AA] text-sm">
              See how consistently your students show up, when they have breakthrough moments, and who's likely to complete your course. Use these insights to provide timely support and celebrate wins.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ConsistencyScoreGauge data={metrics.engagementConsistency} />
            {canAccessMetric(userTier, 'breakthrough') ? (
              <AhaMomentChart data={metrics.ahaMoments} />
            ) : (
              <LockedMetricCard 
                title="Breakthrough Moments"
                description="Content that sparks student success"
                requiredTier="Growth"
              />
            )}
          </div>
        </TabsContent>

        {/* Student Commitment Tab */}
        <TabsContent value="commitment" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-6">
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">🎯 Student Success & Content Paths</h3>
            <p className="text-[#A1A1AA] text-sm">
              Track which students are likely to complete your course and discover the learning paths that lead to success. Use this to identify at-risk students and optimize your content flow.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {canAccessMetric(userTier, 'commitment') ? (
              <CommitmentDistribution data={metrics.commitmentScores} />
            ) : (
              <LockedMetricCard 
                title="Student Commitment"
                description="Who's likely to complete your course"
                requiredTier="Growth"
              />
            )}
            {canAccessMetric(userTier, 'pathways') ? (
              <PathwayTable data={metrics.contentPathways} />
            ) : (
              <LockedMetricCard 
                title="Best Learning Paths"
                description="What content order works best"
                requiredTier="Growth"
              />
            )}
          </div>
        </TabsContent>

        {/* Content Performance Tab */}
        <TabsContent value="content" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-6">
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">🔥 What's Working Right Now</h3>
            <p className="text-[#A1A1AA] text-sm">
              See which content is getting the most attention today and what your students are saying. Use this to double down on what works and improve what doesn't.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PopularContentList data={metrics.popularContent} />
            <FeedbackThemesList data={metrics.feedbackThemes} />
          </div>
        </TabsContent>
      </Tabs>

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
