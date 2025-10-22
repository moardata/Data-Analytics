'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Brain,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';

interface SystemHealthDashboardProps {
  companyId: string;
}

interface HealthData {
  overall: {
    score: number;
    status: string;
    lastUpdated: string;
  };
  dataFreshness: Record<string, number | null>;
  outdatedData: Array<{ type: string; age: number; status: string }>;
  missingData: Array<{ type: string; age: null; status: string }>;
  aiMetrics: {
    averageResponseTime: number;
    successRate: number;
    totalRuns: number;
    recentRuns: number;
  };
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    timestamp: string;
  }>;
  recommendations: string[];
}

export default function SystemHealthDashboard({ companyId }: SystemHealthDashboardProps) {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthData();
  }, [companyId]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/system-health?clientId=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }
      
      const data = await response.json();
      setHealthData(data.health);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to load system health data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-[#10B981]';
      case 'good': return 'text-[#3B82F6]';
      case 'warning': return 'text-[#F59E0B]';
      case 'critical': return 'text-[#EF4444]';
      default: return 'text-[#A1A1AA]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-[#10B981]" />;
      case 'good': return <Activity className="h-5 w-5 text-[#3B82F6]" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-[#EF4444]" />;
      default: return <Info className="h-5 w-5 text-[#A1A1AA]" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
      case 'warning': return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
      case 'info': return 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30';
      default: return 'bg-[#1a1a1a] text-[#A1A1AA] border-[#1a1a1a]';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#F8FAFC]">System Health & Meta Data</h3>
          <RefreshCw className="h-4 w-4 text-[#A1A1AA] animate-spin" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
              <div className="animate-pulse">
                <div className="h-4 bg-[#1a1a1a] rounded mb-2"></div>
                <div className="h-3 bg-[#1a1a1a] rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#F8FAFC]">System Health & Meta Data</h3>
          <Button 
            onClick={fetchHealthData}
            className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="p-6 bg-[#0f0f0f] border-[#1a1a1a]">
          <div className="flex items-center gap-3 text-[#A1A1AA]">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#F8FAFC]">System Health & Meta Data</h3>
        <Card className="p-6 bg-[#0f0f0f] border-[#1a1a1a] text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
            <Database className="h-8 w-8 text-[#A1A1AA]" />
          </div>
          <h3 className="text-lg font-medium text-[#F8FAFC] mb-2">No Health Data</h3>
          <p className="text-[#A1A1AA] mb-4">
            System health monitoring is not available
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#F8FAFC]">System Health & Meta Data</h3>
          <p className="text-sm text-[#A1A1AA]">Monitor data freshness and AI response times</p>
        </div>
        <Button 
          onClick={fetchHealthData}
          className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Health Score */}
      <Card className="p-6 bg-[#0f0f0f] border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(healthData.overall.status)}
            <div>
              <h4 className="font-medium text-[#F8FAFC]">Overall System Health</h4>
              <p className="text-sm text-[#A1A1AA]">
                Last updated: {new Date(healthData.overall.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getStatusColor(healthData.overall.status)}`}>
              {healthData.overall.score}
            </div>
            <div className="text-sm text-[#A1A1AA]">Health Score</div>
          </div>
        </div>
        
        <div className="w-full bg-[#1a1a1a] rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              healthData.overall.score >= 90 ? 'bg-[#10B981]' :
              healthData.overall.score >= 70 ? 'bg-[#3B82F6]' :
              healthData.overall.score >= 50 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
            }`}
            style={{ width: `${healthData.overall.score}%` }}
          />
        </div>
      </Card>

      {/* Data Freshness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-4 w-4 text-[#10B981]" />
            <h5 className="font-medium text-[#F8FAFC]">Data Freshness</h5>
          </div>
          <div className="space-y-2">
            {Object.entries(healthData.dataFreshness).map(([type, age]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-[#A1A1AA] capitalize">
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center gap-2">
                  {age === null ? (
                    <Badge variant="outline" className="border-[#EF4444]/30 text-[#EF4444]">
                      Missing
                    </Badge>
                  ) : age > 30 ? (
                    <Badge variant="outline" className="border-[#F59E0B]/30 text-[#F59E0B]">
                      {age}d old
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-[#10B981]/30 text-[#10B981]">
                      {age}d fresh
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-[#8B5CF6]" />
            <h5 className="font-medium text-[#F8FAFC]">AI Performance</h5>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A1A1AA]">Response Time</span>
              <span className="text-sm text-[#F8FAFC]">{healthData.aiMetrics.averageResponseTime}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A1A1AA]">Success Rate</span>
              <span className="text-sm text-[#F8FAFC]">{healthData.aiMetrics.successRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A1A1AA]">Total Runs</span>
              <span className="text-sm text-[#F8FAFC]">{healthData.aiMetrics.totalRuns}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A1A1AA]">Recent Runs (30d)</span>
              <span className="text-sm text-[#F8FAFC]">{healthData.aiMetrics.recentRuns}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {healthData.alerts.length > 0 && (
        <Card className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
            <h5 className="font-medium text-[#F8FAFC]">System Alerts</h5>
          </div>
          <div className="space-y-2">
            {healthData.alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-center gap-2">
                  {alert.severity === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : alert.severity === 'warning' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-[#10B981]" />
          <h5 className="font-medium text-[#F8FAFC]">Recommendations</h5>
        </div>
        <div className="space-y-2">
          {healthData.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-[#A1A1AA]">{recommendation}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
