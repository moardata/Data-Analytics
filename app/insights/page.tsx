/**
 * AI Insights Page - Metallic Emerald Theme
 * Dedicated page for viewing and generating insights with reflective metallic design
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Sparkles, Zap, RefreshCw, Brain, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightsGrid, Insight } from '@/components/AIInsightsGrid';

// ---------------------- THEME ----------------------
const theme = {
  bg: "bg-gradient-to-b from-[#0d0f12] to-[#14171c]",
  panel: "bg-gradient-to-br from-[#1A1E25] via-[#20242B] to-[#1A1E25] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_12px_rgba(0,0,0,0.6)] backdrop-blur-md",
  border: "border border-[#2E343C]/70",
  text: "text-[#E1E4EA]",
  subtext: "text-[#9AA4B2]",
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

  // Get insight statistics
  const insightStats = {
    total: insights.length,
    recommendations: insights.filter(i => i.insight_type === 'recommendation').length,
    alerts: insights.filter(i => i.insight_type === 'alert').length,
    trends: insights.filter(i => i.insight_type === 'trend').length,
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
                <Brain className="h-6 w-6 text-white" />
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
              className={`${theme.panel} ${theme.border} text-white hover:bg-[#0E3A2F] rounded-xl px-4 py-2 gap-2 transition-all shadow-inner shadow-[#0A0C0F]/20`}
            >
              <Zap className="h-4 w-4" />
              {loading ? 'Generating...' : 'Generate Insights'}
            </Button>
            <Button 
              onClick={refreshInsights}
              disabled={loading}
              variant="outline"
              className={`${theme.border} ${theme.text} hover:bg-[#252A31] hover:text-[#E1E4EA] rounded-xl px-4 py-2 gap-2 transition-all border-[#2E343C]/70 text-[#E1E4EA]`}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{insightStats.alerts}</div>
                  <div className={`${theme.subtext} text-xs`}>Alerts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl overflow-hidden relative`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1015]/50 pointer-events-none" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{insightStats.trends}</div>
                  <div className={`${theme.subtext} text-xs`}>Trends</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Insights Grid */}
        <section>
          {transformedInsights.length === 0 ? (
            <Card className={`${theme.panel} ${theme.border} rounded-xl overflow-hidden relative`}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1015]/50 pointer-events-none" />
              <CardContent className="py-16 text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#2E343C]/50 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-[#9AA4B2]" />
                </div>
                <h3 className="text-xl font-semibold text-[#E1E4EA] mb-2">
                  No insights yet
                </h3>
                <p className={`${theme.subtext} mb-6 max-w-md mx-auto`}>
                  Click "Generate Insights" to analyze your student data and get AI-powered recommendations
                </p>
                <Button 
                  onClick={generateInsights}
                  disabled={loading}
                  className={`${theme.panel} ${theme.border} text-white hover:bg-[#0E3A2F] rounded-xl px-6 py-3 gap-2 transition-all shadow-inner shadow-[#0A0C0F]/20`}
                >
                  <Zap className="h-4 w-4" />
                  Generate Your First Insights
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#E1E4EA]">Recent Insights</h2>
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InsightsContent />
    </Suspense>
  );
}
