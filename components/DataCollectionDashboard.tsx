'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Users, 
  FileText, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';

interface DataCollectionDashboardProps {
  companyId: string;
}

interface DataCollectionData {
  processedData: {
    surveyResponses: any[];
    engagementMetrics: any;
    completionPatterns: any;
    studentProfiles: any[];
    availableSurveys: any[];
  };
  dataQuality: {
    dataVolume: any;
    dataCompleteness: any;
    aiReadiness: any;
  };
  collectionStats: {
    totalSurveyResponses: number;
    totalEngagementEvents: number;
    totalStudents: number;
    activeSurveys: number;
    timeRange: string;
    dataFreshness: string;
  };
}

export default function DataCollectionDashboard({ companyId }: DataCollectionDashboardProps) {
  const [data, setData] = useState<DataCollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDataCollection();
  }, [companyId]);

  const fetchDataCollection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/data-collection?companyId=${companyId}&range=week&includeRaw=false`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.dataCollection);
      }
    } catch (error) {
      console.error('Error fetching data collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDataCollection();
    setRefreshing(false);
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
          <p className="text-[#A1A1AA]">Unable to load data collection metrics</p>
        </CardContent>
      </Card>
    );
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'needs_more_data': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'good': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'needs_more_data': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Database className="h-5 w-5 text-[#10B981]" />
            Data Collection Status
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Multi-tenant data collection with AI processing optimization
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Collection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">{data.collectionStats.totalSurveyResponses}</div>
                <div className="text-sm text-[#A1A1AA]">Survey Responses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">{data.collectionStats.totalEngagementEvents}</div>
                <div className="text-sm text-[#A1A1AA]">Engagement Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">{data.collectionStats.totalStudents}</div>
                <div className="text-sm text-[#A1A1AA]">Students</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">{data.collectionStats.activeSurveys}</div>
                <div className="text-sm text-[#A1A1AA]">Active Surveys</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardHeader>
            <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#10B981]" />
              Data Completeness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Survey Data</span>
              <Badge className={data.dataQuality.dataCompleteness.hasSurveyData ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                {data.dataQuality.dataCompleteness.hasSurveyData ? 'Available' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Engagement Data</span>
              <Badge className={data.dataQuality.dataCompleteness.hasEngagementData ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                {data.dataQuality.dataCompleteness.hasEngagementData ? 'Available' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Student Data</span>
              <Badge className={data.dataQuality.dataCompleteness.hasStudentData ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                {data.dataQuality.dataCompleteness.hasStudentData ? 'Available' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Overall</span>
              <Badge className={data.dataQuality.dataCompleteness.overallCompleteness === 'complete' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}>
                {data.dataQuality.dataCompleteness.overallCompleteness}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
          <CardHeader>
            <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#10B981]" />
              AI Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Sufficient for Analysis</span>
              <Badge className={data.dataQuality.aiReadiness.sufficientForAnalysis ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}>
                {data.dataQuality.aiReadiness.sufficientForAnalysis ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Recommended for AI</span>
              <Badge className={data.dataQuality.aiReadiness.recommendedForAI ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}>
                {data.dataQuality.aiReadiness.recommendedForAI ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Data Quality</span>
              <Badge className={getQualityBadge(data.dataQuality.aiReadiness.dataQuality)}>
                {data.dataQuality.aiReadiness.dataQuality}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Data Richness</span>
              <Badge className={getQualityBadge(data.dataQuality.dataVolume.dataRichness)}>
                {data.dataQuality.dataVolume.dataRichness}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
        <CardHeader>
          <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
            <Database className="h-5 w-5 text-[#10B981]" />
            Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#F8FAFC]">Survey Responses</h4>
              <p className="text-xs text-[#A1A1AA]">
                {data.processedData.surveyResponses.length} responses collected
              </p>
              <p className="text-xs text-[#A1A1AA]">
                Multi-tenant filtered and PII scrubbed
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#F8FAFC]">Engagement Logs</h4>
              <p className="text-xs text-[#A1A1AA]">
                {data.processedData.engagementMetrics.totalEvents} events tracked
              </p>
              <p className="text-xs text-[#A1A1AA]">
                Course access and activity patterns
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#F8FAFC]">Completion Data</h4>
              <p className="text-xs text-[#A1A1AA]">
                {data.processedData.completionPatterns.totalCompletions} completions
              </p>
              <p className="text-xs text-[#A1A1AA]">
                Progress tracking and drop-off analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Info */}
      <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A1A1AA]">
              Data collected over {data.collectionStats.timeRange}
            </span>
            <span className="text-[#A1A1AA]">
              Last updated: {new Date(data.collectionStats.dataFreshness).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
