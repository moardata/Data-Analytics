/**
 * AI Insights Page - Metallic Emerald Theme
 * Dedicated page for viewing and generating insights with reflective metallic design
 * REQUIRES ACTIVE SUBSCRIPTION
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Zap, RefreshCw, TrendingUp, AlertCircle, Lightbulb, Sparkles, Activity, Brain, Target, Download, HelpCircle } from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InsightsGrid, Insight } from '@/components/AIInsightsGrid';
import EngagementMetrics from '@/components/EngagementMetrics';
import DataCollectionDashboard from '@/components/DataCollectionDashboard';
import StructuredAIInsights from '@/components/StructuredAIInsights';
import ActionFeedbackLoop from '@/components/ActionFeedbackLoop';
import ExportsReportsDashboard from '@/components/ExportsReportsDashboard';
import SystemHealthDashboard from '@/components/SystemHealthDashboard';
import { PaywallGuard } from '@/components/PaywallGuard';

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
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly'>('daily');

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

  // Load existing insights when client ID, company ID, or time range changes
  useEffect(() => {
    if (clientId && companyId) {
      loadExistingInsights();
    }
  }, [clientId, companyId, timeRange]);

  const fetchClientId = async (companyId: string) => {
    try {
      // Fetch the actual client UUID from the database
      const response = await fetch(`/api/client/lookup?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setClientId(data.clientId);
        console.log('✅ Got client UUID:', data.clientId);
      }
    } catch (error) {
      console.error('Error fetching client ID:', error);
      // Fallback: use companyId directly for components that can handle it
      setClientId(companyId);
    }
  };

  const loadExistingInsights = async () => {
    try {
      console.log('📡 Loading existing insights for time range:', timeRange);
      const response = await fetch(`/api/insights/generate?companyId=${companyId}&timeRange=${timeRange}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded existing insights:', data);
        setInsights(data.insights || []);
        console.log('📈 Loaded insights count:', data.insights?.length || 0);
      } else {
        console.log('ℹ️ No existing insights found');
        setInsights([]);
      }
    } catch (error) {
      console.error('❌ Error loading existing insights:', error);
      setInsights([]);
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
    metricDeltaPct: insight.confidence ? Math.round(insight.confidence * 100) : undefined,
    status: insight.status || 'generated'
  }));

  const generateInsights = async () => {
    console.log('🚀 Generate Insights clicked');
    console.log('Company ID:', companyId);
    console.log('Time Range:', timeRange);
    
    if (!companyId) {
      console.error('❌ No company ID available');
      return;
    }
    
    setLoading(true);
    console.log('⏳ Starting insight generation...');
    
    try {
      console.log('📡 Making API call to /api/insights/generate');
      const response = await fetch(`/api/insights/generate?companyId=${companyId}&timeRange=${timeRange}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeRange: timeRange,
          includeAnomalies: true
        })
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Generated insights:', data);
        setInsights(data.insights || []);
        console.log('📈 Insights set:', data.insights?.length || 0, 'insights');
        
        // Show success popup
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000); // Auto-hide after 3 seconds
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        console.error('❌ Full error object:', JSON.stringify(errorData, null, 2));
        alert(`Error: ${errorData.error || 'Failed to generate insights'}\n\nFull error: ${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      console.error('❌ Error generating insights:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      console.log('✅ Loading finished');
    }
  };

  const handleRefresh = async () => {
    if (!companyId) {
      console.error('❌ No companyId provided for refresh');
      return;
    }
    
    try {
      setRefreshing(true);
      console.log('🔄 Refreshing insights for company:', companyId);
      console.log('🔄 Time range:', timeRange);
      
      // Re-generate insights (force fresh calculation)
      const response = await fetch(`/api/insights/generate?companyId=${companyId}&timeRange=${timeRange}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeRange: timeRange,
          includeAnomalies: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Refresh response error:', response.status, errorText);
        throw new Error(`Refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Insights refreshed successfully:', data);
      setInsights(data.insights || []);
      
      // Show success notification
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      console.log('📊 Insights refreshed at:', new Date().toISOString());
    } catch (error) {
      console.error('❌ Error refreshing insights:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh insights';
      alert(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  // Show loading state while getting company ID
  if (!companyId) {
    return (
      <div className={`min-h-screen ${theme.bg}`}>
        <LoadingScreen message="Loading AI Insights" size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] px-6 py-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#F8FAFC]">Insights Generated</p>
              <p className="text-sm text-[#A1A1AA]">AI analysis completed</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-2">
                AI Insights
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#8B5CF6]/50 rounded-full mb-3"></div>
            </div>
            <p className="text-[#A1A1AA]">
              AI-powered recommendations and analytics for your community
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-1">
              <button
                onClick={() => setTimeRange('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'daily'
                    ? 'border border-[#10B981]/30 bg-[#0B2C24] text-[#10B981]'
                    : 'text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#1a1a1a]'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'weekly'
                    ? 'border border-[#10B981]/30 bg-[#0B2C24] text-[#10B981]'
                    : 'text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#1a1a1a]'
                }`}
              >
                Weekly
              </button>
            </div>
            
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
              onClick={handleRefresh}
              disabled={refreshing || loading || !companyId}
              className="border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#0f0f0f] text-[#F8FAFC] rounded-xl px-4 py-3 disabled:opacity-50 transition-all"
              title="Refresh insights"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-[#10B981]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-[#F8FAFC]">{insights.length}</p>
                  <p className="text-xs text-[#A1A1AA] truncate">Total Insights</p>
                </div>
              </div>
              <div className="group/info relative flex-shrink-0">
                <HelpCircle className="h-3.5 w-3.5 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors" />
                <div className="invisible group-hover/info:visible absolute right-0 top-6 w-56 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                  <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Total Insights</p>
                  <p className="text-xs text-[#A1A1AA]">All AI-generated insights for your selected time range. More insights = more actionable data!</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-4 w-4 text-[#8B5CF6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.insight_type === 'recommendation').length}</p>
                  <p className="text-xs text-[#A1A1AA] truncate">Recommendations</p>
                </div>
              </div>
              <div className="group/info relative flex-shrink-0">
                <HelpCircle className="h-3.5 w-3.5 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors" />
                <div className="invisible group-hover/info:visible absolute right-0 top-6 w-56 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                  <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Recommendations</p>
                  <p className="text-xs text-[#A1A1AA]">Actionable suggestions to improve your course. Implement these to boost student success!</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-[#EF4444]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.metadata?.urgency === 'high').length}</p>
                  <p className="text-xs text-[#A1A1AA] truncate">High Priority</p>
                </div>
              </div>
              <div className="group/info relative flex-shrink-0">
                <HelpCircle className="h-3.5 w-3.5 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors" />
                <div className="invisible group-hover/info:visible absolute right-0 top-6 w-56 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                  <p className="text-xs text-[#F8FAFC] font-semibold mb-1">High Priority</p>
                  <p className="text-xs text-[#A1A1AA]">Urgent insights needing immediate attention. Address these first for maximum impact!</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.metadata?.sentiment === 'negative' || i.insight_type === 'alert').length}</p>
                  <p className="text-xs text-[#A1A1AA] truncate">Issues</p>
                </div>
              </div>
              <div className="group/info relative flex-shrink-0">
                <HelpCircle className="h-3.5 w-3.5 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors" />
                <div className="invisible group-hover/info:visible absolute right-0 top-6 w-56 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                  <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Issues Detected</p>
                  <p className="text-xs text-[#A1A1AA]">Problems identified in your course or student engagement. Fix these to improve outcomes!</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-[#10B981]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.metadata?.ai_generated === true).length}</p>
                  <p className="text-xs text-[#A1A1AA] truncate">AI Generated</p>
                </div>
              </div>
              <div className="group/info relative flex-shrink-0">
                <HelpCircle className="h-3.5 w-3.5 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors" />
                <div className="invisible group-hover/info:visible absolute right-0 top-6 w-56 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                  <p className="text-xs text-[#F8FAFC] font-semibold mb-1">AI Generated</p>
                  <p className="text-xs text-[#A1A1AA]">Insights created by AI analysis of your student data. Fresh, intelligent recommendations!</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className={`${theme.panel} ${theme.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-[#10B981]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-[#F8FAFC]">{insights.filter(i => i.metadata?.sentiment === 'positive').length}</p>
                  <p className="text-xs text-[#A1A1AA] truncate">Positive</p>
                </div>
              </div>
              <div className="group/info relative flex-shrink-0">
                <HelpCircle className="h-3.5 w-3.5 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors" />
                <div className="invisible group-hover/info:visible absolute right-0 top-6 w-56 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                  <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Positive Trends</p>
                  <p className="text-xs text-[#A1A1AA]">Great things happening in your community. Celebrate and amplify what's working!</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-[#0f0f0f] border border-[#1a1a1a]">
            <TabsTrigger value="insights" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(16,185,129,0.6)] data-[state=active]:border data-[state=active]:border-[#10B981]/50">
              My Insights
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(139,92,246,0.6)] data-[state=active]:border data-[state=active]:border-[#8B5CF6]/50">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-[#F59E0B] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(245,158,11,0.6)] data-[state=active]:border data-[state=active]:border-[#F59E0B]/50">
              Actions
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(59,130,246,0.6)] data-[state=active]:border data-[state=active]:border-[#3B82F6]/50">
              Data
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(16,185,129,0.6)] data-[state=active]:border data-[state=active]:border-[#10B981]/50">
              Reports
            </TabsTrigger>
          </TabsList>

          {/* My Insights Tab */}
          <TabsContent value="insights" className="mt-6">
            <div className="space-y-6">
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
                    items={transformedInsights.filter(i => i.status !== 'action_taken')}
                    columns={{ base: 1, md: 2, xl: 3 }}
                    onOpen={(id) => console.log('Opened insight:', id)}
                    onMarkActioned={(id) => {
                      console.log('Insight marked as actioned:', id);
                      // Refresh insights to update the lists
                      handleRefresh();
                    }}
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
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-medium text-[#F8FAFC]">Structured AI Analysis</h3>
                    <div className="group/info relative">
                      <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#8B5CF6] cursor-help transition-colors" />
                      <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#8B5CF6]/30 rounded-lg shadow-xl z-50">
                        <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Structured AI Analysis</p>
                        <p className="text-xs text-[#A1A1AA]">AI-organized insights by category. Quickly scan recommendations, issues, and trends to prioritize actions.</p>
                      </div>
                    </div>
                  </div>
                  <StructuredAIInsights companyId={companyId || ''} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-medium text-[#F8FAFC]">Engagement Analytics</h3>
                    <div className="group/info relative">
                      <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#8B5CF6] cursor-help transition-colors" />
                      <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#8B5CF6]/30 rounded-lg shadow-xl z-50">
                        <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Engagement Analytics</p>
                        <p className="text-xs text-[#A1A1AA]">Track student activity, content views, and participation trends. See who's engaged and who needs attention.</p>
                      </div>
                    </div>
                  </div>
                  <EngagementMetrics companyId={companyId || ''} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-[#F8FAFC]">Action Feedback Loop</h3>
                <div className="group/info relative">
                  <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#F59E0B] cursor-help transition-colors" />
                  <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#F59E0B]/30 rounded-lg shadow-xl z-50">
                    <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Action Feedback Loop</p>
                    <p className="text-xs text-[#A1A1AA]">Track which insights you've acted on and measure results. Close the loop from insight to action to impact.</p>
                  </div>
                </div>
              </div>
              <ActionFeedbackLoop companyId={companyId || ''} />
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-medium text-[#F8FAFC]">Data Collection Status</h3>
                    <div className="group/info relative">
                      <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#3B82F6] cursor-help transition-colors" />
                      <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#3B82F6]/30 rounded-lg shadow-xl z-50">
                        <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Data Collection Status</p>
                        <p className="text-xs text-[#A1A1AA]">Monitor how much data is being collected from students. More data = better AI insights and recommendations.</p>
                      </div>
                    </div>
                  </div>
                  <DataCollectionDashboard companyId={companyId || ''} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-medium text-[#F8FAFC]">System Health</h3>
                    <div className="group/info relative">
                      <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#3B82F6] cursor-help transition-colors" />
                      <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#3B82F6]/30 rounded-lg shadow-xl z-50">
                        <p className="text-xs text-[#F8FAFC] font-semibold mb-1">System Health</p>
                        <p className="text-xs text-[#A1A1AA]">Check the status of AI processing, integrations, and data pipelines. Ensure everything is running smoothly.</p>
                      </div>
                    </div>
                  </div>
                  <SystemHealthDashboard companyId={companyId || ''} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-[#F8FAFC]">Exports & Reports</h3>
                <div className="group/info relative">
                  <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors" />
                  <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                    <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Exports & Reports</p>
                    <p className="text-xs text-[#A1A1AA]">Download your data and insights as CSV, PDF, or Excel. Share reports with your team or analyze externally.</p>
                  </div>
                </div>
              </div>
              <ExportsReportsDashboard companyId={companyId || ''} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <PaywallGuard feature="AI Insights">
      <InsightsContent />
    </PaywallGuard>
  );
}
