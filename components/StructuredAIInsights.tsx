'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingDown, 
  Heart, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react';

interface StructuredAIInsightsProps {
  companyId: string;
}

interface AIInsight {
  insight: string;
  recommendation: string;
  category: 'drop_off' | 'sentiment' | 'engagement' | 'pacing' | 'clarity' | 'general';
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dataPoints: number;
  affectedStudents?: number;
}

interface AIAnalysisResult {
  insights: AIInsight[];
  summary: string;
  keyFindings: string[];
  confidence: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function StructuredAIInsights({ companyId }: StructuredAIInsightsProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [companyId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/insights/analyze?range=week&companyId=${companyId}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`/api/insights/analyze?companyId=${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange: 'week', forceRefresh: true })
      });
      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drop_off': return <TrendingDown className="h-4 w-4" />;
      case 'sentiment': return <Heart className="h-4 w-4" />;
      case 'engagement': return <Users className="h-4 w-4" />;
      case 'pacing': return <Clock className="h-4 w-4" />;
      case 'clarity': return <Lightbulb className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'drop_off': return 'text-[#FF0080] bg-[#FF0080]/15 border-[#FF0080]/40 shadow-[0_0_10px_rgba(255,0,128,0.3)]';
      case 'sentiment': return 'text-[#FF1493] bg-[#FF1493]/15 border-[#FF1493]/40 shadow-[0_0_10px_rgba(255,20,147,0.3)]';
      case 'engagement': return 'text-[#00FFFF] bg-[#00FFFF]/15 border-[#00FFFF]/40 shadow-[0_0_10px_rgba(0,255,255,0.3)]';
      case 'pacing': return 'text-[#FFD700] bg-[#FFD700]/15 border-[#FFD700]/40 shadow-[0_0_10px_rgba(255,215,0,0.3)]';
      case 'clarity': return 'text-[#32CD32] bg-[#32CD32]/15 border-[#32CD32]/40 shadow-[0_0_10px_rgba(50,205,50,0.3)]';
      default: return 'text-[#9370DB] bg-[#9370DB]/15 border-[#9370DB]/40 shadow-[0_0_10px_rgba(147,112,219,0.3)]';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-[#FF0040] bg-[#FF0040]/15 border-[#FF0040]/40 shadow-[0_0_15px_rgba(255,0,64,0.4)]';
      case 'high': return 'text-[#FF6600] bg-[#FF6600]/15 border-[#FF6600]/40 shadow-[0_0_12px_rgba(255,102,0,0.4)]';
      case 'medium': return 'text-[#FFEB3B] bg-[#FFEB3B]/15 border-[#FFEB3B]/40 shadow-[0_0_10px_rgba(255,235,59,0.4)]';
      case 'low': return 'text-[#00FF88] bg-[#00FF88]/15 border-[#00FF88]/40 shadow-[0_0_8px_rgba(0,255,136,0.4)]';
      default: return 'text-[#8A2BE2] bg-[#8A2BE2]/15 border-[#8A2BE2]/40 shadow-[0_0_10px_rgba(138,43,226,0.4)]';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-[#00FF88] bg-[#00FF88]/15 border-[#00FF88]/40 shadow-[0_0_8px_rgba(0,255,136,0.4)]';
    if (confidence >= 60) return 'text-[#FFEB3B] bg-[#FFEB3B]/15 border-[#FFEB3B]/40 shadow-[0_0_10px_rgba(255,235,59,0.4)]';
    return 'text-[#FF0040] bg-[#FF0040]/15 border-[#FF0040]/40 shadow-[0_0_15px_rgba(255,0,64,0.4)]';
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

  if (!analysis) {
    return (
      <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
        <CardContent className="p-6 text-center space-y-4">
          <Brain className="h-12 w-12 mx-auto text-[#2A2F36]" />
          <div>
            <p className="text-[#F8FAFC] font-medium mb-2">No AI Analysis Available</p>
            <p className="text-[#A1A1AA] text-sm">
              There isn't enough data yet to generate insights. Submit some surveys or collect more data first.
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#0E9F71] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Try to Generate Analysis'}
          </button>
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
            <Brain className="h-5 w-5 text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
            AI Analysis Results
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Structured analysis focusing on drop-offs, sentiment, engagement, and pacing
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-lg transition-colors"
        >
          <BarChart3 className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Analysis Summary */}
      <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
        <CardHeader>
          <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
            <Target className="h-5 w-5 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#A1A1AA]">{analysis.summary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#A1A1AA]">Confidence:</span>
              <Badge className={getConfidenceColor(analysis.confidence)}>
                {analysis.confidence}%
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#A1A1AA]">Data Quality:</span>
              <Badge className={getSeverityColor(analysis.dataQuality)}>
                {analysis.dataQuality}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#A1A1AA]">Insights:</span>
              <Badge className="bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/40 shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                {analysis.insights.length}
              </Badge>
            </div>
          </div>

          {analysis.keyFindings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#F8FAFC] mb-2">Key Findings:</h4>
              <ul className="space-y-1">
                {analysis.keyFindings.map((finding, index) => (
                  <li key={index} className="text-sm text-[#A1A1AA] flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-[#32CD32] mt-0.5 flex-shrink-0 drop-shadow-[0_0_6px_rgba(50,205,50,0.6)]" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Structured Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#F8FAFC]">Structured Insights</h3>
        
        {analysis.insights.map((insight, index) => (
          <Card key={index} className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFFF]/20 to-[#00FFFF]/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.3)] border border-[#00FFFF]/30">
                    {getCategoryIcon(insight.category)}
                  </div>
                  <div>
                    <CardTitle className="text-[#F8FAFC] text-base">
                      {insight.insight}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getCategoryColor(insight.category)}>
                        {insight.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#A1A1AA]">Confidence</div>
                  <div className={`text-lg font-semibold ${getConfidenceColor(insight.confidence)}`}>
                    {insight.confidence}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[#F8FAFC] mb-2">Recommendation:</h4>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">
                  {insight.recommendation}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[#A1A1AA]">Data Points:</span>
                  <div className="font-medium text-[#F8FAFC]">{insight.dataPoints}</div>
                </div>
                {insight.affectedStudents && (
                  <div>
                    <span className="text-[#A1A1AA]">Affected Students:</span>
                    <div className="font-medium text-[#F8FAFC]">{insight.affectedStudents}</div>
                  </div>
                )}
                <div>
                  <span className="text-[#A1A1AA]">Category:</span>
                  <div className="font-medium text-[#F8FAFC] capitalize">
                    {insight.category.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <span className="text-[#A1A1AA]">Severity:</span>
                  <div className="font-medium text-[#F8FAFC] capitalize">{insight.severity}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {analysis.insights.length === 0 && (
        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-[#A1A1AA] mx-auto mb-2" />
            <p className="text-[#A1A1AA]">No insights generated</p>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Try collecting more student data or run the analysis again
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
