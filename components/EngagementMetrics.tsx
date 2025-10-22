'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Activity, AlertTriangle, Smile, Frown } from 'lucide-react';

interface EngagementMetricsProps {
  companyId: string;
}

interface EngagementData {
  overview: {
    engagementScore: number;
    totalSubmissions: number;
    totalEvents: number;
    activeDays: number;
    avgSubmissionsPerDay: number;
  };
  trends: {
    submissions: {
      recent: number;
      previous: number;
      change: number;
    };
    activity: {
      recent: number;
      previous: number;
      change: number;
    };
  };
  dropOffs: {
    totalDropOffs: number;
    reasons: Record<string, number>;
    topReason: string;
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
    overallSentiment: string;
  };
}

export default function EngagementMetrics({ companyId }: EngagementMetricsProps) {
  const [data, setData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementData();
  }, [companyId]);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/insights/engagement?companyId=${companyId}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.metrics);
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
        <CardContent className="p-6 text-center">
          <p className="text-[#A1A1AA]">Unable to load engagement metrics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">{data.overview.engagementScore}</div>
                <div className="text-sm text-[#A1A1AA]">Engagement Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">{data.overview.totalSubmissions}</div>
                <div className="text-sm text-[#A1A1AA]">Total Submissions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">{data.overview.activeDays}</div>
                <div className="text-sm text-[#A1A1AA]">Active Days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">{data.overview.avgSubmissionsPerDay.toFixed(1)}</div>
                <div className="text-sm text-[#A1A1AA]">Avg/Day</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardHeader>
            <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#10B981]" />
              Submission Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">This Week</span>
                <span className="text-[#F8FAFC] font-semibold">{data.trends.submissions.recent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Last Week</span>
                <span className="text-[#F8FAFC] font-semibold">{data.trends.submissions.previous}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Change</span>
                <div className="flex items-center gap-2">
                  {data.trends.submissions.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`font-semibold ${data.trends.submissions.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.abs(data.trends.submissions.change).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardHeader>
            <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#10B981]" />
              Activity Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">This Week</span>
                <span className="text-[#F8FAFC] font-semibold">{data.trends.activity.recent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Last Week</span>
                <span className="text-[#F8FAFC] font-semibold">{data.trends.activity.previous}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Change</span>
                <div className="flex items-center gap-2">
                  {data.trends.activity.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`font-semibold ${data.trends.activity.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.abs(data.trends.activity.change).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drop-offs and Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardHeader>
            <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Drop-off Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Total Drop-offs</span>
                <span className="text-[#F8FAFC] font-semibold">{data.dropOffs.totalDropOffs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Top Issue</span>
                <span className="text-[#F8FAFC] font-semibold text-sm">{data.dropOffs.topReason}</span>
              </div>
              {Object.keys(data.dropOffs.reasons).length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-[#A1A1AA] mb-2">Drop-off Reasons:</div>
                  {Object.entries(data.dropOffs.reasons).map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between text-sm">
                      <span className="text-[#A1A1AA]">{reason}</span>
                      <span className="text-[#F8FAFC]">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardHeader>
            <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
              {data.sentiment.overallSentiment === 'positive' ? (
                <Smile className="h-5 w-5 text-green-400" />
              ) : data.sentiment.overallSentiment === 'negative' ? (
                <Frown className="h-5 w-5 text-red-400" />
              ) : (
                <Activity className="h-5 w-5 text-gray-400" />
              )}
              Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Overall Sentiment</span>
                <span className={`font-semibold capitalize ${
                  data.sentiment.overallSentiment === 'positive' ? 'text-green-400' :
                  data.sentiment.overallSentiment === 'negative' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {data.sentiment.overallSentiment}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Positive</span>
                <span className="text-green-400 font-semibold">{data.sentiment.positivePercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Negative</span>
                <span className="text-red-400 font-semibold">{data.sentiment.negativePercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Neutral</span>
                <span className="text-gray-400 font-semibold">
                  {100 - data.sentiment.positivePercentage - data.sentiment.negativePercentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
