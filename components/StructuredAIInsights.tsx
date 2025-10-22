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
      const response = await fetch(`/api/insights/analyze?range=week`);
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
      const response = await fetch('/api/insights/analyze', {
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
      case 'drop_off': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'sentiment': return 'text-pink-400 bg-pink-500/20 border-pink-500/30';
      case 'engagement': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'pacing': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'clarity': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
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
        <CardContent className="p-6 text-center">
          <p className="text-[#A1A1AA]">Unable to load AI analysis</p>
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
            <Brain className="h-5 w-5 text-[#10B981]" />
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
            <Target className="h-5 w-5 text-[#10B981]" />
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
              <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
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
                    <CheckCircle className="h-3 w-3 text-[#10B981] mt-0.5 flex-shrink-0" />
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
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
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
