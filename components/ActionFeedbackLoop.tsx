'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle,
  Target,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Clock
} from 'lucide-react';

interface ActionFeedbackLoopProps {
  companyId: string;
}

interface Action {
  id: string;
  action_type: string;
  improvement_description: string;
  created_at: string;
  insights: {
    id: string;
    title: string;
    category: string;
  };
}

interface Improvement {
  id: string;
  improvement_percentage: number;
  improvement_summary: string;
  created_at: string;
  insights: {
    title: string;
    category: string;
  };
  insight_actions: {
    action_type: string;
    improvement_description: string;
  };
}

interface Summary {
  totalActions: number;
  averageImprovement: number;
  bestImprovement: number;
  totalMetricsImproved: number;
  improvementRate: number;
}

export default function ActionFeedbackLoop({ companyId }: ActionFeedbackLoopProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbackData();
  }, [companyId]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Default to empty data
      let actionsData = { actions: [] };
      let improvementsData = { improvements: [], summary: null };
      
      // Fetch actions
      try {
        const actionsResponse = await fetch(`/api/insights/feedback-loop?companyId=${companyId}`);
        if (actionsResponse.ok) {
          actionsData = await actionsResponse.json();
        }
      } catch (actionsError) {
        console.warn('Actions API failed, using empty data');
      }
      
      // Fetch improvements
      try {
        const improvementsResponse = await fetch(`/api/insights/improvement-tracking?companyId=${companyId}`);
        if (improvementsResponse.ok) {
          improvementsData = await improvementsResponse.json();
        }
      } catch (improvementsError) {
        console.warn('Improvements API failed, using empty data');
      }

      setActions(actionsData.actions || []);
      setImprovements(improvementsData.improvements || []);
      setSummary(improvementsData.summary || null);
      
    } catch (err) {
      console.error('Error fetching feedback data:', err);
      // Don't set error - just show empty state
      setActions([]);
      setImprovements([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async (actionId: string, insightId: string) => {
    try {
      const response = await fetch('/api/insights/improvement-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: companyId, insightId, actionId })
      });

      if (response.ok) {
        // Refresh data to show new summary
        fetchFeedbackData();
      }
    } catch (err) {
      console.error('Error generating summary:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#F8FAFC]">Action & Feedback Loop</h3>
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
          <h3 className="text-lg font-medium text-[#F8FAFC]">Action & Feedback Loop</h3>
          <Button 
            onClick={fetchFeedbackData}
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

  // Show empty state if no data
  if (actions.length === 0 && improvements.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6 bg-[#0f0f0f] border-[#1a1a1a] text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-[#2A2F36]" />
          <h3 className="text-lg font-medium text-[#F8FAFC] mb-2">No Actions Tracked Yet</h3>
          <p className="text-[#A1A1AA] mb-4 max-w-md mx-auto">
            Actions and improvements will appear here once you:
            <br/>1. Generate AI insights from your data
            <br/>2. Mark insights as "Acted Upon"
            <br/>3. Track the improvements over time
          </p>
          <Button 
            onClick={fetchFeedbackData}
            className="bg-[#10B981] hover:bg-[#0E9F71] text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#F8FAFC]">Action & Feedback Loop</h3>
          <p className="text-sm text-[#A1A1AA]">Track creator actions and measure improvements</p>
        </div>
        <Button 
          onClick={fetchFeedbackData}
          className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Total Actions</p>
                <p className="text-xl font-semibold text-[#F8FAFC]">{summary.totalActions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Avg Improvement</p>
                <p className="text-xl font-semibold text-[#F8FAFC]">{summary.averageImprovement}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Best Improvement</p>
                <p className="text-xl font-semibold text-[#F8FAFC]">{summary.bestImprovement}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Success Rate</p>
                <p className="text-xl font-semibold text-[#F8FAFC]">{summary.improvementRate}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Actions */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-[#F8FAFC]">Recent Actions</h4>
        <div className="space-y-3">
          {actions.slice(0, 5).map((action) => (
            <Card key={action.id} className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-[#1a1a1a] text-[#A1A1AA]">
                      {action.action_type}
                    </Badge>
                    <span className="text-xs text-[#A1A1AA]">
                      {new Date(action.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h5 className="font-medium text-[#F8FAFC] mb-1">
                    {action.insights.title}
                  </h5>
                  <p className="text-sm text-[#A1A1AA] mb-2">
                    {action.improvement_description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[#1a1a1a] text-[#A1A1AA]">
                      {action.insights.category}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleGenerateSummary(action.id, action.insights.id)}
                  className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Generate Summary
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Improvement Results */}
      {improvements.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-[#F8FAFC]">Improvement Results</h4>
          <div className="space-y-3">
            {improvements.slice(0, 3).map((improvement) => (
              <Card key={improvement.id} className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {improvement.improvement_percentage > 0 ? (
                          <TrendingUp className="h-4 w-4 text-[#10B981]" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-[#EF4444]" />
                        )}
                        <span className={`font-medium ${
                          improvement.improvement_percentage > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                        }`}>
                          {improvement.improvement_percentage > 0 ? '+' : ''}{improvement.improvement_percentage}%
                        </span>
                      </div>
                      <span className="text-xs text-[#A1A1AA]">
                        {new Date(improvement.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="font-medium text-[#F8FAFC] mb-1">
                      {improvement.insights.title}
                    </h5>
                    <p className="text-sm text-[#A1A1AA] mb-2">
                      {improvement.improvement_summary}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-[#1a1a1a] text-[#A1A1AA]">
                        {improvement.insights.category}
                      </Badge>
                      <Badge variant="outline" className="border-[#1a1a1a] text-[#A1A1AA]">
                        {improvement.insight_actions.action_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {actions.length === 0 && improvements.length === 0 && (
        <Card className="p-8 bg-[#0f0f0f] border-[#1a1a1a] text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
            <Target className="h-8 w-8 text-[#A1A1AA]" />
          </div>
          <h3 className="text-lg font-medium text-[#F8FAFC] mb-2">No Actions Yet</h3>
          <p className="text-[#A1A1AA] mb-4">
            Start by taking action on insights to begin the feedback loop
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#A1A1AA]">
            <ArrowRight className="h-4 w-4" />
            <span>Read insights → Take action → Measure improvement</span>
          </div>
        </Card>
      )}
    </div>
  );
}
