'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

interface EnhancedInsightsDisplayProps {
  companyId: string;
}

interface InsightCard {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  category: 'performance' | 'retention' | 'feedback' | 'trend';
  severity: 'positive' | 'warning' | 'urgent';
  status: 'new' | 'viewed' | 'done';
  createdAt: string;
  details?: string;
  recommendations?: string[];
  dataPoints?: number;
  affectedStudents?: number;
}

interface InsightsHistory {
  id: string;
  timestamp: string;
  totalInsights: number;
  categories: Record<string, number>;
  summary: string;
}

export default function EnhancedInsightsDisplay({ companyId }: EnhancedInsightsDisplayProps) {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [history, setHistory] = useState<InsightsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    fetchInsights();
    fetchHistory();
  }, [companyId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/insights/analyze?range=week`);
      const result = await response.json();
      
      if (result.success && result.analysis.insights) {
        const formattedInsights = result.analysis.insights.map((insight: any, index: number) => ({
          id: `insight-${index}`,
          title: insight.insight,
          summary: insight.recommendation,
          confidence: insight.confidence,
          category: mapCategory(insight.category),
          severity: mapSeverity(insight.severity),
          status: 'new' as const,
          createdAt: new Date().toISOString(),
          details: insight.insight,
          recommendations: [insight.recommendation],
          dataPoints: insight.dataPoints,
          affectedStudents: insight.affectedStudents
        }));
        setInsights(formattedInsights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      // Mock history data - in real implementation, this would fetch from database
      const mockHistory: InsightsHistory[] = [
        {
          id: 'history-1',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          totalInsights: 8,
          categories: { performance: 3, retention: 2, feedback: 2, trend: 1 },
          summary: 'Previous analysis showed engagement improvements'
        },
        {
          id: 'history-2',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          totalInsights: 12,
          categories: { performance: 4, retention: 3, feedback: 3, trend: 2 },
          summary: 'Analysis revealed course pacing issues'
        }
      ];
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const mapCategory = (category: string): 'performance' | 'retention' | 'feedback' | 'trend' => {
    switch (category) {
      case 'drop_off':
      case 'pacing':
        return 'performance';
      case 'engagement':
        return 'retention';
      case 'sentiment':
        return 'feedback';
      case 'general':
      default:
        return 'trend';
    }
  };

  const mapSeverity = (severity: string): 'positive' | 'warning' | 'urgent' => {
    switch (severity) {
      case 'low':
        return 'positive';
      case 'medium':
        return 'warning';
      case 'high':
      case 'critical':
        return 'urgent';
      default:
        return 'warning';
    }
  };

  const handleMarkAsDone = async (insightId: string) => {
    try {
      const response = await fetch('/api/insights/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_done', insightId })
      });

      if (response.ok) {
        setInsights(prev => prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, status: 'done' as const }
            : insight
        ));
      }
    } catch (error) {
      console.error('Error marking insight as done:', error);
    }
  };

  const handleViewDetails = async (insightId: string) => {
    try {
      const response = await fetch('/api/insights/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view_details', insightId })
      });

      if (response.ok) {
        setInsights(prev => prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, status: 'viewed' as const }
            : insight
        ));
      }
    } catch (error) {
      console.error('Error tracking insight view:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'retention': return <Users className="h-4 w-4" />;
      case 'feedback': return <MessageSquare className="h-4 w-4" />;
      case 'trend': return <BarChart3 className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'retention': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'feedback': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'trend': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'positive': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'viewed': return <Eye className="h-4 w-4 text-yellow-400" />;
      case 'done': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      default: return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'current') return insight.status !== 'done';
    if (activeTab === 'done') return insight.status === 'done';
    return true;
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#F8FAFC] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#10B981]" />
            Insights Display
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Card-based insights with categories, severity indicators, and actions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#0f0f0f] border border-[#1a1a1a]">
          <TabsTrigger value="current" className="data-[state=active]:bg-[#10B981]/20 data-[state=active]:text-[#10B981]">
            Current ({insights.filter(i => i.status !== 'done').length})
          </TabsTrigger>
          <TabsTrigger value="done" className="data-[state=active]:bg-[#10B981]/20 data-[state=active]:text-[#10B981]">
            Done ({insights.filter(i => i.status === 'done').length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#10B981]/20 data-[state=active]:text-[#10B981]">
            History ({history.length})
          </TabsTrigger>
        </TabsList>

        {/* Current Insights */}
        <TabsContent value="current" className="space-y-4">
          {filteredInsights.length === 0 ? (
            <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-[#A1A1AA] mx-auto mb-2" />
                <p className="text-[#A1A1AA]">No current insights available</p>
                <p className="text-sm text-[#A1A1AA] mt-1">
                  Run an analysis to generate new insights
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInsights.map((insight) => (
                <Card key={insight.id} className="border border-[#1a1a1a] bg-[#0f0f0f] hover:bg-[#1a1a1a]/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                          {getCategoryIcon(insight.category)}
                        </div>
                        <div>
                          <CardTitle className="text-[#F8FAFC] text-base">
                            {insight.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryColor(insight.category)}>
                              {insight.category}
                            </Badge>
                            <Badge className={getSeverityColor(insight.severity)}>
                              {insight.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(insight.status)}
                        <div className="text-right">
                          <div className="text-sm text-[#A1A1AA]">Confidence</div>
                          <div className={`text-sm font-semibold ${getConfidenceColor(insight.confidence)}`}>
                            {insight.confidence}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[#A1A1AA] text-sm leading-relaxed">
                      {insight.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-[#A1A1AA]">
                        {insight.dataPoints && (
                          <span>Data: {insight.dataPoints}</span>
                        )}
                        {insight.affectedStudents && (
                          <span>Students: {insight.affectedStudents}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(insight.id)}
                          className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsDone(insight.id)}
                          className="bg-[#10B981] hover:bg-[#0ea86e] text-white"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark as Done
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Done Insights */}
        <TabsContent value="done" className="space-y-4">
          {insights.filter(i => i.status === 'done').length === 0 ? (
            <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-[#A1A1AA] mx-auto mb-2" />
                <p className="text-[#A1A1AA]">No completed insights</p>
                <p className="text-sm text-[#A1A1AA] mt-1">
                  Mark insights as done to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.filter(i => i.status === 'done').map((insight) => (
                <Card key={insight.id} className="border border-[#1a1a1a] bg-[#0f0f0f] opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-[#F8FAFC] text-base line-through">
                            {insight.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryColor(insight.category)}>
                              {insight.category}
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Completed
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed">
                      {insight.summary}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {history.length === 0 ? (
            <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-[#A1A1AA] mx-auto mb-2" />
                <p className="text-[#A1A1AA]">No analysis history available</p>
                <p className="text-sm text-[#A1A1AA] mt-1">
                  Previous analyses will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <Card key={entry.id} className="border border-[#1a1a1a] bg-[#0f0f0f]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-[#F8FAFC] text-base">
                          Analysis from {new Date(entry.timestamp).toLocaleDateString()}
                        </CardTitle>
                        <p className="text-sm text-[#A1A1AA] mt-1">
                          {entry.summary}
                        </p>
                      </div>
                      <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                        {entry.totalInsights} insights
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(entry.categories).map(([category, count]) => (
                        <div key={category} className="text-center">
                          <div className="text-2xl font-bold text-[#F8FAFC]">{count}</div>
                          <div className="text-sm text-[#A1A1AA] capitalize">{category}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
