/**
 * AI Insights Page - Metallic Emerald Theme
 * Dedicated page for viewing and generating insights with reflective metallic design
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Zap, RefreshCw, TrendingUp, AlertCircle, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightsGrid, Insight } from '@/components/AIInsightsGrid';
import EngagementMetrics from '@/components/EngagementMetrics';
import DataCollectionDashboard from '@/components/DataCollectionDashboard';
import StructuredAIInsights from '@/components/StructuredAIInsights';
import EnhancedInsightsDisplay from '@/components/EnhancedInsightsDisplay';
import DataStorageDashboard from '@/components/DataStorageDashboard';
import ActionFeedbackLoop from '@/components/ActionFeedbackLoop';

// ---------------------- THEME ----------------------
const theme = {
  bg: "bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]",
  panel: "bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_12px_rgba(0,0,0,0.6)] backdrop-blur-md",
  border: "border border-[#1a1a1a]/70",
  text: "text-[#F8FAFC]",
  subtext: "text-[#A1A1AA]",
  accent: "#10B981",
};

function InsightsContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [clientId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/insights/generate?companyId=${clientId}&limit=20`);
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyId: clientId,
          timeRange: 'week',
          includeAnomalies: true 
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
        alert(`Generated ${data.count} new insights!`);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyId: clientId,
          force: true 
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
        alert('Insights refreshed!');
      }
    } catch (error) {
      console.error('Error refreshing insights:', error);
      alert('Failed to refresh insights');
    } finally {
      setLoading(false);
    }
  };

  // Transform insights to match AI grid format
  const transformedInsights: Insight[] = insights.map(ins => ({
    id: ins.id || Math.random().toString(),
    headline: ins.title || 'Insight',
    detail: ins.content || ins.body || '',
    createdAt: ins.created_at || ins.createdAt || new Date().toISOString(),
    severity: ins.severity === 'alert' ? 'critical' : ins.severity === 'warning' ? 'warning' : ins.type === 'recommendation' ? 'success' : 'info',
    tags: ins.meta?.tags || [],
    metricDeltaPct: ins.meta?.share_pct
  }));

  // Get enhanced insight statistics
  const insightStats = {
    total: insights.length,
    recommendations: insights.filter(i => i.insight_type === 'recommendation').length,
    alerts: insights.filter(i => i.insight_type === 'alert').length,
    trends: insights.filter(i => i.insight_type === 'trend').length,
    // Enhanced metrics
    highUrgency: insights.filter(i => i.metadata?.urgency === 'high').length,
    positiveSentiment: insights.filter(i => i.metadata?.sentiment === 'positive').length,
    negativeSentiment: insights.filter(i => i.metadata?.sentiment === 'negative').length,
    aiGenerated: insights.filter(i => i.metadata?.ai_generated === true).length,
  };

  if (loading && insights.length === 0) {
    return (
      <div className={`${theme.bg} ${theme.text} min-h-screen flex items-center justify-center`}>
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen w-full`}>
      <div className="mx-auto max-w-[1240px] px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981] flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              AI Insights
            </h1>
            <p className={`${theme.subtext} text-sm mt-1`}>
              AI-powered recommendations and analytics for your community
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generateInsights}
              disabled={loading}
              className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-xl px-4 py-2 gap-2 transition-all"
            >
              <Zap className="h-4 w-4" />
              {loading ? 'Generating...' : 'Generate Insights'}
            </Button>
            <Button 
              onClick={refreshInsights}
              disabled={loading}
              variant="outline"
              className="border border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a] hover:text-white rounded-xl px-4 py-2 gap-2 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className={`${theme.panel} ${theme.border} rounded-xl overflow-hidden relative`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1015]/50 pointer-events-none" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{insightStats.total}</div>
                  <div className={`${theme.subtext} text-xs`}>Total Insights</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl overflow-hidden relative`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1015]/50 pointer-events-none" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{insightStats.recommendations}</div>
                  <div className={`${theme.subtext} text-xs`}>Recommendations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl overflow-hidden relative`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1015]/50 pointer-events-none" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{insightStats.highUrgency}</div>
                  <div className={`${theme.subtext} text-xs`}>High Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl overflow-hidden relative`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1015]/50 pointer-events-none" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{insightStats.positiveSentiment}</div>
                  <div className={`${theme.subtext} text-xs`}>Positive</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl overflow-hidden relative`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1015]/50 pointer-events-none" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{insightStats.negativeSentiment}</div>
                  <div className={`${theme.subtext} text-xs`}>Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl overflow-hidden relative`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1015]/50 pointer-events-none" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{insightStats.aiGenerated}</div>
                  <div className={`${theme.subtext} text-xs`}>AI Generated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Collection Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#F8FAFC]">Data Collection Status</h2>
            <p className="text-sm text-[#A1A1AA]">Multi-tenant data collection and AI processing</p>
          </div>
          <DataCollectionDashboard companyId={clientId || ''} />
        </section>

        {/* Data Storage Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#F8FAFC]">Data Storage Status</h2>
            <p className="text-sm text-[#A1A1AA]">Insights storage with timestamps, metadata, and progress tracking</p>
          </div>
          <DataStorageDashboard companyId={clientId || ''} />
        </section>

        {/* Enhanced Insights Display Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#F8FAFC]">Insights Display</h2>
            <p className="text-sm text-[#A1A1AA]">Card-based insights with categories, severity indicators, and actions</p>
          </div>
          <EnhancedInsightsDisplay companyId={clientId || ''} />
        </section>

        {/* Structured AI Analysis Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#F8FAFC]">AI Analysis Results</h2>
            <p className="text-sm text-[#A1A1AA]">Structured analysis focusing on drop-offs, sentiment, and engagement</p>
          </div>
          <StructuredAIInsights companyId={clientId || ''} />
        </section>

        {/* Engagement Metrics Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#F8FAFC]">Engagement Analytics</h2>
            <p className="text-sm text-[#A1A1AA]">Detailed metrics and trends</p>
          </div>
          <EngagementMetrics companyId={clientId || ''} />
        </section>

        {/* Action & Feedback Loop Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#F8FAFC]">Action & Feedback Loop</h2>
            <p className="text-sm text-[#A1A1AA]">Track creator actions and measure improvements</p>
          </div>
          <ActionFeedbackLoop companyId={clientId || ''} />
        </section>

        {/* Insights Grid */}
        <section>
          {transformedInsights.length === 0 ? (
            <Card className={`${theme.panel} ${theme.border} rounded-xl overflow-hidden relative`}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1015]/50 pointer-events-none" />
              <CardContent className="py-16 text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-[#A1A1AA]" />
                </div>
                <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">
                  No insights yet
                </h3>
                <p className={`${theme.subtext} mb-6 max-w-md mx-auto`}>
                  Click "Generate Insights" to analyze your student data and get AI-powered recommendations
                </p>
                <Button 
                  onClick={generateInsights}
                  disabled={loading}
                  className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-xl px-6 py-3 gap-2 transition-all"
                >
                  <Zap className="h-4 w-4" />
                  Generate Your First Insights
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#F8FAFC]">Recent Insights</h2>
                <div className={`${theme.subtext} text-sm`}>
                  {transformedInsights.length} insights available
                </div>
              </div>
              <InsightsGrid 
                items={transformedInsights}
                columns={{ base: 1, md: 2, xl: 3 }}
                onOpen={(id) => console.log('Opened insight:', id)}
                accent="#10B981"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InsightsContent />
    </Suspense>
  );
}
