/**
 * Usage Dashboard Component
 * Shows current usage vs tier limits with visual progress bars
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Users, FileText, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

interface UsageDashboardProps {
  companyId: string;
}

interface UsageData {
  tier: string;
  tierInfo: {
    displayName: string;
    limits: any;
  };
  usage: {
    studentCount: number;
    responsesThisMonth: number;
    aiInsightsToday: number;
  };
  isOnTrial: boolean;
  trialEndsAt?: string;
}

export function UsageDashboard({ companyId }: UsageDashboardProps) {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, [companyId]);

  const fetchUsage = async () => {
    try {
      const res = await fetch(`/api/usage/stats?companyId=${companyId}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#1a1a1a] rounded w-1/4"></div>
            <div className="h-20 bg-[#1a1a1a] rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { tier, tierInfo, usage, isOnTrial, trialEndsAt } = data;
  const limits = tierInfo.limits;

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 999999) return 0; // Unlimited
    return Math.min(Math.round((current / limit) * 100), 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  const studentUsage = getUsagePercentage(usage.studentCount, limits.maxStudents);
  const responseUsage = getUsagePercentage(usage.responsesThisMonth, limits.maxResponsesPerMonth);
  const insightUsage = getUsagePercentage(usage.aiInsightsToday, limits.aiInsightsPerDay);

  const usageItems = [
    {
      label: 'Students',
      current: usage.studentCount,
      limit: limits.maxStudents,
      percentage: studentUsage,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Responses This Month',
      current: usage.responsesThisMonth,
      limit: limits.maxResponsesPerMonth,
      percentage: responseUsage,
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      label: 'AI Insights Today',
      current: usage.aiInsightsToday,
      limit: limits.aiInsightsPerDay,
      percentage: insightUsage,
      icon: Zap,
      color: 'bg-green-500',
    },
  ];

  const hasHighUsage = usageItems.some(item => item.percentage >= 75);

  return (
    <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-[#F8FAFC] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#10B981]" />
            Usage & Limits
          </CardTitle>
          <div className="flex items-center gap-2">
            {isOnTrial && (
              <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                Trial
              </Badge>
            )}
            <Badge variant="outline" className="border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10">
              {tierInfo.displayName}
            </Badge>
          </div>
        </div>
        {isOnTrial && trialEndsAt && (
          <p className="text-xs text-[#A1A1AA] mt-2">
            Trial ends {new Date(trialEndsAt).toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Items */}
        {usageItems.map((item) => {
          const Icon = item.icon;
          const isUnlimited = item.limit === 999999;
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${item.color}/20 flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-sm font-medium text-[#F8FAFC]">{item.label}</span>
                </div>
                <span className={`text-sm font-semibold ${getStatusColor(item.percentage)}`}>
                  {item.current} / {isUnlimited ? '∞' : item.limit}
                </span>
              </div>
              {!isUnlimited && (
                <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              )}
              {!isUnlimited && item.percentage >= 90 && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>Approaching limit - consider upgrading</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Upgrade CTA */}
        {hasHighUsage && (
          <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-[#10B981]/10 to-[#10B981]/5 border border-[#10B981]/20">
              <Crown className="h-8 w-8 text-[#10B981]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#F8FAFC]">Running low on capacity?</p>
                <p className="text-xs text-[#A1A1AA] mt-1">Upgrade to get more students, responses, and AI insights</p>
              </div>
              <Link href={`/upgrade?companyId=${companyId}`}>
                <Button className="bg-[#10B981] hover:bg-[#0E9F71] text-white">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

