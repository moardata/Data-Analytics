'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Calendar, Download } from 'lucide-react';

/**
 * CREATOR ANALYTICS – DASHBOARD (Mapped Metrics)
 * ---------------------------------------------------------
 * Matches the "Dashboard Layout Mapping" doc:
 * Row 1: Active Students, Engagement Rate, Form Responses, Avg Feedback Rating
 * Row 2: Positive Sentiment Ratio, Top Themes, New Insights, Gross Revenue
 * Footer: System Health (Survey Completion, Data Freshness, AI Processing Speed) + Exports
 *
 * Uses your dark metallic + emerald theme from globals/card/button.
 */

// Colors
const EMERALD = '#10B981'; // emerald-500
const EMERALD_DARK = '#0E3A2F';
const PANEL_BORDER = '#2A2F36';
const PANEL_BG = '#16191F';

// ----------------------------------------
// Small chart primitives
// ----------------------------------------
function Sparkline({ data }: { data: { day: string; v: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={84}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1d2127" vertical={false} />
        <XAxis dataKey="day" hide />
        <YAxis hide domain={[0, 'dataMax + 20%']} />
        <Tooltip
          contentStyle={{ background: '#0F1319', border: `1px solid ${PANEL_BORDER}`, borderRadius: 10 }}
          labelStyle={{ color: '#E5E7EB' }}
          itemStyle={{ color: '#E5E7EB' }}
        />
        <Line type="monotone" dataKey="v" stroke={EMERALD} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Donut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <ResponsiveContainer width="100%" height={140}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? EMERALD : i === 1 ? '#64748B' : '#ef4444'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number, n: string) => [`${v}%`, n]}
          contentStyle={{ background: '#0F1319', border: `1px solid ${PANEL_BORDER}`, borderRadius: 10 }}
          labelStyle={{ color: '#E5E7EB' }}
          itemStyle={{ color: '#E5E7EB' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ----------------------------------------
// Reusable UI bits
// ----------------------------------------
function StatHeader({ title, value, sub, delta }: { title: string; value: string; sub?: string; delta?: string }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-[13px] text-zinc-400">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
        {sub && <div className="text-sm text-zinc-500">{sub}</div>}
      </div>
      {delta && (
        <div className="rounded-full bg-emerald-900/20 px-2 py-1 text-[12px] font-medium text-emerald-300 border border-emerald-700/40">
          {delta}
        </div>
      )}
    </div>
  );
}

function Panel({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <Card
      className={cn(
        'relative rounded-2xl border border-[#2A2F36] bg-[#16191F] overflow-hidden',
        'shadow-[0_0_0_1px_rgba(42,47,54,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]',
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
  data: {
    activeStudentsSeries: { day: string; v: number }[];
    engagementRateSeries: { day: string; v: number }[];
    formResponsesSeries: { day: string; v: number }[];
    avgFeedbackSeries: { day: string; v: number }[];
    grossRevenueSeries: { day: string; v: number }[];
    sentiment: { name: string; value: number }[];
    themes: { label: string; count: number }[];
    newInsights: string[];
    activeStudents: { current: string; sub: string; delta: string };
    engagementRate: { current: string; sub: string; delta: string };
    formResponses: { current: string; sub: string; delta: string };
    avgFeedback: { current: string; sub: string };
    positiveSentiment: { current: string; sub: string };
    grossRevenue: { current: string; sub: string; delta: string };
    systemHealth: {
      surveyCompletionRate: number;
      dataFreshnessMinutes: number;
      aiLatencySeconds: number;
    };
  };
  onExportEventsCsv?: () => void;
  onExportSubscriptionsCsv?: () => void;
  onExportPdf?: () => void;
}

// ----------------------------------------
// Main component
// ----------------------------------------
export default function DashboardCreatorAnalytics({ data, onExportEventsCsv, onExportSubscriptionsCsv, onExportPdf }: DashboardCreatorAnalyticsProps) {
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-lg font-semibold text-white">Dashboard</div>
        <div className="ml-auto flex items-center gap-2">
          <Link href={`/analytics${queryString}`}>
            <Button className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60">
              <Calendar className="mr-2 h-4 w-4" /> Analytics
            </Button>
          </Link>
          <Link href={`/insights${queryString}`}>
            <Button className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60">AI Insights</Button>
          </Link>
          <Link href={`/forms${queryString}`}>
            <Button className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60">Forms</Button>
          </Link>
          <Link href={`/students${queryString}`}>
            <Button className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60">Students</Button>
          </Link>
          <Button 
            onClick={onExportPdf}
            className="border border-emerald-700/60 bg-emerald-900/40 hover:bg-emerald-900/60"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Grid: 2 rows × 4 cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Row 1 */}
        <Panel>
          <StatHeader 
            title="Active Students" 
            value={data.activeStudents.current} 
            sub={data.activeStudents.sub} 
            delta={data.activeStudents.delta} 
          />
          <div className="mt-3"><Sparkline data={data.activeStudentsSeries} /></div>
        </Panel>

        <Panel>
          <StatHeader 
            title="Engagement Rate" 
            value={data.engagementRate.current} 
            sub={data.engagementRate.sub} 
            delta={data.engagementRate.delta} 
          />
          <div className="mt-3"><Sparkline data={data.engagementRateSeries} /></div>
        </Panel>

        <Panel>
          <StatHeader 
            title="Form Responses" 
            value={data.formResponses.current} 
            sub={data.formResponses.sub} 
            delta={data.formResponses.delta} 
          />
          <div className="mt-3"><Sparkline data={data.formResponsesSeries} /></div>
        </Panel>

        <Panel>
          <StatHeader 
            title="Avg Feedback Rating" 
            value={data.avgFeedback.current} 
            sub={data.avgFeedback.sub} 
          />
          <div className="mt-3"><Sparkline data={data.avgFeedbackSeries} /></div>
        </Panel>

        {/* Row 2 */}
        <Panel>
          <StatHeader 
            title="Positive Sentiment" 
            value={data.positiveSentiment.current} 
            sub={data.positiveSentiment.sub} 
          />
          <div className="mt-3"><Donut data={data.sentiment} /></div>
        </Panel>

        <Panel>
          <div className="mb-3">
            <div className="text-[13px] text-zinc-400">Top Feedback Themes</div>
            <div className="text-sm text-zinc-500">Last 7 days</div>
          </div>
          <ul className="space-y-2">
            {data.themes.map((t) => (
              <li key={t.label} className="flex items-center justify-between rounded-lg border border-[#2A2F36] bg-[#0F1319] px-3 py-2 text-sm">
                <span className="text-zinc-300">{t.label}</span>
                <span className="rounded bg-emerald-900/20 px-2 py-0.5 text-emerald-300 border border-emerald-700/40 text-[12px]">{t.count}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <div className="mb-3">
            <div className="text-[13px] text-zinc-400">New Actionable Insights</div>
            <div className="text-sm text-zinc-500">AI suggestions</div>
          </div>
          <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1">
            {data.newInsights.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <StatHeader 
            title="Gross Revenue" 
            value={data.grossRevenue.current} 
            sub={data.grossRevenue.sub} 
            delta={data.grossRevenue.delta} 
          />
          <div className="mt-3"><Sparkline data={data.grossRevenueSeries} /></div>
        </Panel>
      </div>

      {/* Footer: System Health + Exports */}
      <Panel>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="text-[13px] text-zinc-400">System Health</div>
            <div className="flex flex-wrap gap-2 text-sm">
              <BadgeComponent label={`Survey Completion: ${(data.systemHealth.surveyCompletionRate * 100).toFixed(0)}%`} />
              <BadgeComponent label={`Data Freshness: ${data.systemHealth.dataFreshnessMinutes}m`} />
              <BadgeComponent label={`AI Processing: ${data.systemHealth.aiLatencySeconds}s`} />
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
