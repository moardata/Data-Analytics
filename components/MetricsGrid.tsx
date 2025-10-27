/**
 * Metrics Grid Component
 * Displays key performance metrics in a card grid with info tooltips
 */

'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface MetricCardData {
  label: string;
  value: string | number;
  change?: number;
  icon?: string;
  tooltip: string;
}

interface MetricsGridProps {
  metrics: any;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricsData: MetricCardData[] = [
    {
      label: 'Total Students',
      value: metrics?.totalStudents || 0,
      change: metrics?.studentsChange,
      icon: '👥',
      tooltip: 'Total number of students enrolled. Track growth and reach of your content.',
    },
    {
      label: 'Active Subscriptions',
      value: metrics?.activeSubscriptions || 0,
      change: metrics?.subscriptionsChange,
      icon: '📊',
      tooltip: 'Currently active paying subscriptions. Indicates your recurring revenue health.',
    },
    {
      label: 'Total Revenue',
      value: `$${(metrics?.totalRevenue || 0).toFixed(2)}`,
      change: metrics?.revenueChange,
      icon: '💰',
      tooltip: 'Total revenue generated. Monitor your business performance and growth.',
    },
    {
      label: 'Engagement Rate',
      value: `${(metrics?.engagementRate || 0).toFixed(1)}%`,
      change: metrics?.engagementChange,
      icon: '⚡',
      tooltip: 'How actively students interact with your content. Higher = better retention.',
    },
    {
      label: 'Completion Rate',
      value: `${(metrics?.completionRate || 0).toFixed(1)}%`,
      change: metrics?.completionChange,
      icon: '🎯',
      tooltip: 'Percentage of students completing your course. Indicates content effectiveness.',
    },
    {
      label: 'New This Week',
      value: metrics?.newThisWeek || 0,
      icon: '🆕',
      tooltip: 'New students who joined in the last 7 days. Track recent growth momentum.',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metricsData.map((metric, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">{metric.icon}</span>
            {metric.change !== undefined && (
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                metric.change >= 0 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
              </span>
            )}
          </div>
          <div className="text-5xl font-black text-gray-950 mb-2">
            {metric.value}
          </div>
          <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <span>{metric.label}</span>
            <Tooltip content={metric.tooltip}>
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
}

