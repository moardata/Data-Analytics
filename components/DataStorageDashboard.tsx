'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  History,
  Activity,
  FileText,
  Brain
} from 'lucide-react';

interface DataStorageDashboardProps {
  companyId: string;
}

interface StorageStatistics {
  totalInsights: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  recentActivity: number;
  completionRate: number;
}

interface StorageHistory {
  id: string;
  timestamp: string;
  totalInsights: number;
  categories: Record<string, number>;
  summary: string;
  datasetId: string;
  model: string;
  version: string;
}

export default function DataStorageDashboard({ companyId }: DataStorageDashboardProps) {
  const [statistics, setStatistics] = useState<StorageStatistics | null>(null);
  const [history, setHistory] = useState<StorageHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStorageData();
  }, [companyId]);

  const fetchStorageData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsResponse = await fetch(`/api/data-storage?action=get_statistics&companyId=${companyId}`);
      const statsResult = await statsResponse.json();
      
      if (statsResult.success) {
        setStatistics(statsResult.data);
      }

      // Fetch history
      const historyResponse = await fetch(`/api/data-storage?action=get_history&limit=10&companyId=${companyId}`);
      const historyResult = await historyResponse.json();
      
      if (historyResult.success) {
        setHistory(historyResult.data);
      }
    } catch (error) {
      console.error('Error fetching storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'viewed': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'done': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
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
      case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Database className="h-5 w-5 text-[#10B981]" />
            Data Storage Status
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Insights storage with timestamps, metadata, and progress tracking
          </p>
        </div>
      </div>

      {/* Storage Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#F8FAFC]">{statistics.totalInsights}</div>
                  <div className="text-sm text-[#A1A1AA]">Total Insights</div>
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
                  <div className="text-2xl font-bold text-[#F8FAFC]">{statistics.recentActivity}</div>
                  <div className="text-sm text-[#A1A1AA]">Recent Activity</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#F8FAFC]">{statistics.completionRate.toFixed(1)}%</div>
                  <div className="text-sm text-[#A1A1AA]">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#F8FAFC]">{Object.keys(statistics.byCategory).length}</div>
                  <div className="text-sm text-[#A1A1AA]">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Breakdown */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#10B981]" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(statistics.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-[#A1A1AA] capitalize">{status}</span>
                  <Badge className={getStatusColor(status)}>
                    {count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#10B981]" />
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(statistics.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-[#A1A1AA] capitalize">{category}</span>
                  <Badge className={getCategoryColor(category)}>
                    {count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#10B981]" />
                Severity Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(statistics.bySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <span className="text-[#A1A1AA] capitalize">{severity}</span>
                  <Badge className={getSeverityColor(severity)}>
                    {count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Storage History */}
      <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
        <CardHeader>
          <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
            <History className="h-5 w-5 text-[#10B981]" />
            Storage History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-6">
              <History className="h-8 w-8 text-[#A1A1AA] mx-auto mb-2" />
              <p className="text-[#A1A1AA]">No storage history available</p>
              <p className="text-sm text-[#A1A1AA] mt-1">
                Run AI analysis to generate storage history
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="border border-[#1a1a1a] rounded-lg p-4 bg-[#0a0a0a]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-[#F8FAFC] font-medium">
                        {new Date(entry.timestamp).toLocaleDateString()} - {entry.model} v{entry.version}
                      </h4>
                      <p className="text-sm text-[#A1A1AA]">{entry.summary}</p>
                    </div>
                    <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                      {entry.totalInsights} insights
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(entry.categories).map(([category, count]) => (
                      <div key={category} className="text-center">
                        <div className="text-lg font-bold text-[#F8FAFC]">{count}</div>
                        <div className="text-xs text-[#A1A1AA] capitalize">{category}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 text-xs text-[#A1A1AA]">
                    Dataset ID: {entry.datasetId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Metadata */}
      <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A1A1AA]">
              Storage Version: 2.0
            </span>
            <span className="text-[#A1A1AA]">
              Last Updated: {new Date().toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
