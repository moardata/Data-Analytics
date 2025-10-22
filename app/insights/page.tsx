/**
 * AI Insights Page - Metallic Emerald Theme
 * Dedicated page for viewing and generating insights with reflective metallic design
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Zap, RefreshCw, TrendingUp, AlertCircle, Lightbulb, Sparkles, Activity, Brain, Target, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InsightsGrid, Insight } from '@/components/AIInsightsGrid';
import EngagementMetrics from '@/components/EngagementMetrics';
import DataCollectionDashboard from '@/components/DataCollectionDashboard';
import StructuredAIInsights from '@/components/StructuredAIInsights';
import EnhancedInsightsDisplay from '@/components/EnhancedInsightsDisplay';
import DataStorageDashboard from '@/components/DataStorageDashboard';
import ActionFeedbackLoop from '@/components/ActionFeedbackLoop';
import ExportsReportsDashboard from '@/components/ExportsReportsDashboard';
import SystemHealthDashboard from '@/components/SystemHealthDashboard';

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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

  // Get company ID from URL (same as analytics page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const companyIdFromUrl = params.get('companyId') || 
                            window.location.pathname.split('/').find(part => part.startsWith('biz_')) || 
                            null;
    setCompanyId(companyIdFromUrl);
    console.log('✅ Company ID from URL:', companyIdFromUrl);
  }, []);

  // Convert company ID to client ID
  useEffect(() => {
    if (companyId) {
      fetchClientId(companyId);
    }
  }, [companyId]);

  const fetchClientId = async (companyId: string) => {
    try {
      const response = await fetch(`/api/analytics/metrics?companyId=${companyId}`);
      if (response.ok) {
        // If the API call succeeds, we know the client exists
        // We'll get the client ID from the insights API
        setClientId('found'); // Placeholder - the API will handle the lookup
      }
    } catch (error) {
      console.error('Error fetching client ID:', error);
    }
  };

  // Transform insights for the grid
  const transformedInsights: Insight[] = insights.map(insight => ({
    id: insight.id,
    headline: insight.title,
    detail: insight.content,
    createdAt: insight.createdAt || new Date().toISOString(),
    severity: insight.priority === 'high' ? 'critical' : 
              insight.priority === 'medium' ? 'warning' : 
              insight.category === 'positive' ? 'success' : 'info',
    tags: insight.tags || [],
    metricDeltaPct: insight.confidence ? Math.round(insight.confidence * 100) : undefined
  }));

  const generateInsights = async () => {
    if (!companyId) {
      console.error('No company ID available');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeRange: 'week',
          includeAnomalies: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Generated insights:', data);
        setInsights(data.insights || []);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while getting company ID
  if (!companyId) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p className="text-[#F8FAFC]">Loading AI Insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981] flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              AI Insights
            </h1>
            <p className="text-[#A1A1AA] mt-2">
              AI-powered recommendations and analytics for your community
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={generateInsights}
              disabled={loading || !companyId}
              className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-xl px-6 py-3 gap-2 transition-all"
            >
              <Zap className="h-4 w-4" />
              {!companyId ? 'Loading...' : loading ? 'Generating...' : 'Generate Insights'}
            </Button>
            <Button 
              variant="outline"
              className="border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a] rounded-xl px-4 py-3"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#10B981]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#F8FAFC]">{insights.length}</p>
                <p className="text-xs text-[#A1A1AA]">Total Insights</p>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.category === 'recommendation').length}</p>
                <p className="text-xs text-[#A1A1AA]">Recommendations</p>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EF4444]/20 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-[#EF4444]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.priority === 'high').length}</p>
                <p className="text-xs text-[#A1A1AA]">High Priority</p>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.category === 'issue').length}</p>
                <p className="text-xs text-[#A1A1AA]">Issues</p>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-[#10B981]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.status === 'generated').length}</p>
                <p className="text-xs text-[#A1A1AA]">AI Generated</p>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-[#10B981]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.category === 'positive').length}</p>
                <p className="text-xs text-[#A1A1AA]">Positive</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-[#0f0f0f] border border-[#1a1a1a]">
            <TabsTrigger value="insights" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              My Insights
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white">
              <Brain className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-[#F59E0B] data-[state=active]:text-white">
              <Target className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              Data
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
              <Download className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* My Insights Tab */}
          <TabsContent value="insights" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[#F8FAFC] mb-4">Enhanced Insights Display</h3>
                <EnhancedInsightsDisplay companyId={clientId || ''} />
              </div>
              
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
                      disabled={loading || !companyId}
                      className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-xl px-6 py-3 gap-2 transition-all"
                    >
                      <Zap className="h-4 w-4" />
                      {!companyId ? 'Loading...' : loading ? 'Generating...' : 'Generate Your First Insights'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-[#F8FAFC]">Recent Insights</h3>
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
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-[#F8FAFC] mb-4">Structured AI Analysis</h3>
                  <StructuredAIInsights companyId={clientId || ''} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-[#F8FAFC] mb-4">Engagement Analytics</h3>
                  <EngagementMetrics companyId={clientId || ''} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-[#F8FAFC] mb-4">Action & Feedback Loop</h3>
                  <ActionFeedbackLoop companyId={clientId || ''} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-[#F8FAFC] mb-4">Data Storage & History</h3>
                  <DataStorageDashboard companyId={clientId || ''} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-[#F8FAFC] mb-4">Data Collection Status</h3>
                  <DataCollectionDashboard companyId={clientId || ''} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-[#F8FAFC] mb-4">System Health & Meta Data</h3>
                  <SystemHealthDashboard companyId={clientId || ''} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[#F8FAFC] mb-4">Export Options & Reports</h3>
                <ExportsReportsDashboard companyId={clientId || ''} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
