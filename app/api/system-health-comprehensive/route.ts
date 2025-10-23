/**
 * Comprehensive System Health API
 * Combines data quality, performance, and system health monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';
import { performanceMonitor } from '@/lib/monitoring/performance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    // Get client ID
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const clientId = clientData.id;

    // Get comprehensive system health
    const systemHealth = await getComprehensiveSystemHealth(clientId);

    return NextResponse.json({
      success: true,
      clientId,
      companyId,
      systemHealth,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Comprehensive system health error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getComprehensiveSystemHealth(clientId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get all system data
  const [
    eventsResult,
    submissionsResult,
    entitiesResult,
    subscriptionsResult,
    insightsResult,
    aiRunsResult
  ] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('client_id', clientId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000),

    supabase
      .from('form_submissions')
      .select('*')
      .eq('client_id', clientId)
      .gte('submitted_at', thirtyDaysAgo.toISOString())
      .order('submitted_at', { ascending: false })
      .limit(1000),

    supabase
      .from('entities')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1000),

    supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1000),

    supabase
      .from('insights')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(100),

    supabase
      .from('ai_runs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(100)
  ]);

  const events = eventsResult.data || [];
  const submissions = submissionsResult.data || [];
  const entities = entitiesResult.data || [];
  const subscriptions = subscriptionsResult.data || [];
  const insights = insightsResult.data || [];
  const aiRuns = aiRunsResult.data || [];

  // Data freshness analysis
  const dataFreshness = {
    events: {
      total: events.length,
      last7Days: events.filter(e => new Date(e.created_at) > sevenDaysAgo).length,
      last30Days: events.length,
      oldestRecord: events.length > 0 ? events[events.length - 1].created_at : null,
      newestRecord: events.length > 0 ? events[0].created_at : null,
      freshnessScore: events.length > 0 ? Math.min(100, (events.filter(e => new Date(e.created_at) > sevenDaysAgo).length / events.length) * 100) : 0
    },
    submissions: {
      total: submissions.length,
      last7Days: submissions.filter(s => new Date(s.submitted_at) > sevenDaysAgo).length,
      last30Days: submissions.length,
      oldestRecord: submissions.length > 0 ? submissions[submissions.length - 1].submitted_at : null,
      newestRecord: submissions.length > 0 ? submissions[0].submitted_at : null,
      freshnessScore: submissions.length > 0 ? Math.min(100, (submissions.filter(s => new Date(s.submitted_at) > sevenDaysAgo).length / submissions.length) * 100) : 0
    },
    entities: {
      total: entities.length,
      last7Days: entities.filter(e => new Date(e.created_at) > sevenDaysAgo).length,
      last30Days: entities.filter(e => new Date(e.created_at) > thirtyDaysAgo).length,
      oldestRecord: entities.length > 0 ? entities[entities.length - 1].created_at : null,
      newestRecord: entities.length > 0 ? entities[0].created_at : null,
      freshnessScore: entities.length > 0 ? Math.min(100, (entities.filter(e => new Date(e.created_at) > sevenDaysAgo).length / entities.length) * 100) : 0
    },
    subscriptions: {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      expired: subscriptions.filter(s => s.status === 'expired').length,
      freshnessScore: subscriptions.length > 0 ? Math.min(100, (subscriptions.filter(s => s.status === 'active').length / subscriptions.length) * 100) : 0
    },
    insights: {
      total: insights.length,
      last7Days: insights.filter(i => new Date(i.created_at) > sevenDaysAgo).length,
      last30Days: insights.length,
      oldestRecord: insights.length > 0 ? insights[insights.length - 1].created_at : null,
      newestRecord: insights.length > 0 ? insights[0].created_at : null,
      freshnessScore: insights.length > 0 ? Math.min(100, (insights.filter(i => new Date(i.created_at) > sevenDaysAgo).length / insights.length) * 100) : 0
    }
  };

  // AI performance analysis
  const aiPerformance = {
    totalRuns: aiRuns.length,
    successfulRuns: aiRuns.filter(r => r.status === 'completed').length,
    failedRuns: aiRuns.filter(r => r.status === 'failed').length,
    successRate: aiRuns.length > 0 ? (aiRuns.filter(r => r.status === 'completed').length / aiRuns.length) * 100 : 0,
    averageResponseTime: aiRuns.length > 0 ? 
      aiRuns.reduce((sum, r) => sum + (r.response_time || 0), 0) / aiRuns.length : 0,
    lastRun: aiRuns.length > 0 ? aiRuns[0].created_at : null
  };

  // Performance metrics
  const performanceMetrics = performanceMonitor.getPerformanceSummary('day');
  const performanceAlerts = performanceMonitor.getAlerts('day');

  // Generate comprehensive alerts
  const alerts = [];

  // Data freshness alerts
  Object.entries(dataFreshness).forEach(([dataType, data]) => {
    if (data.freshnessScore < 50 && data.total > 0) {
      alerts.push({
        type: 'data_freshness',
        severity: data.freshnessScore < 10 ? 'critical' : 'warning',
        message: `${dataType} data freshness is ${data.freshnessScore.toFixed(1)}% (${data.last7Days}/${data.total} records in last 7 days)`,
        dataType,
        score: data.freshnessScore
      });
    }

    if (data.total === 0) {
      alerts.push({
        type: 'data_missing',
        severity: 'error',
        message: `No ${dataType} data found`,
        dataType,
        score: 0
      });
    }
  });

  // AI performance alerts
  if (aiPerformance.successRate < 80 && aiPerformance.totalRuns > 0) {
    alerts.push({
      type: 'ai_performance',
      severity: aiPerformance.successRate < 50 ? 'critical' : 'warning',
      message: `AI success rate is ${aiPerformance.successRate.toFixed(1)}% (threshold: 80%)`,
      dataType: 'ai',
      score: aiPerformance.successRate
    });
  }

  if (aiPerformance.averageResponseTime > 30 && aiPerformance.totalRuns > 0) {
    alerts.push({
      type: 'ai_response_time',
      severity: aiPerformance.averageResponseTime > 60 ? 'critical' : 'warning',
      message: `AI average response time is ${aiPerformance.averageResponseTime.toFixed(1)}s (threshold: 30s)`,
      dataType: 'ai',
      score: aiPerformance.averageResponseTime
    });
  }

  // Performance alerts
  performanceAlerts.forEach(alert => {
    alerts.push({
      type: 'performance',
      severity: alert.severity,
      message: alert.message,
      dataType: 'system',
      score: alert.actual
    });
  });

  // Calculate overall system health score
  const dataHealthScore = Object.values(dataFreshness).reduce((sum, data) => sum + data.freshnessScore, 0) / Object.keys(dataFreshness).length;
  const aiHealthScore = aiPerformance.totalRuns > 0 ? aiPerformance.successRate : 100;
  const performanceHealthScore = performanceMetrics.healthScore;
  
  const overallHealthScore = Math.round((dataHealthScore * 0.4) + (aiHealthScore * 0.3) + (performanceHealthScore * 0.3));

  // Generate recommendations
  const recommendations = generateSystemRecommendations(dataFreshness, aiPerformance, performanceMetrics, alerts);

  return {
    overall: {
      score: overallHealthScore,
      status: overallHealthScore >= 90 ? 'excellent' : overallHealthScore >= 70 ? 'good' : overallHealthScore >= 50 ? 'warning' : 'critical',
      lastUpdated: now.toISOString()
    },
    dataFreshness,
    aiPerformance,
    performanceMetrics,
    alerts,
    recommendations,
    summary: {
      totalDataPoints: events.length + submissions.length + entities.length + subscriptions.length + insights.length,
      activeAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      systemUptime: '99.9%', // Would be calculated from actual uptime data
      lastDataUpdate: Math.max(
        ...Object.values(dataFreshness).map(d => d.newestRecord ? new Date(d.newestRecord).getTime() : 0)
      )
    }
  };
}

function generateSystemRecommendations(dataFreshness: any, aiPerformance: any, performanceMetrics: any, alerts: any[]): string[] {
  const recommendations = [];

  // Data freshness recommendations
  if (dataFreshness.events.freshnessScore < 50) {
    recommendations.push('Check webhook configuration - events may not be flowing properly');
  }

  if (dataFreshness.submissions.freshnessScore < 50) {
    recommendations.push('Review survey distribution and student engagement - form submissions are low');
  }

  if (dataFreshness.insights.freshnessScore < 50) {
    recommendations.push('Generate new AI insights to maintain data freshness');
  }

  // AI performance recommendations
  if (aiPerformance.successRate < 80) {
    recommendations.push('Review AI model configuration and input data quality');
  }

  if (aiPerformance.averageResponseTime > 30) {
    recommendations.push('Optimize AI processing pipeline for faster responses');
  }

  // Performance recommendations
  if (performanceMetrics.averageResponseTime > 2000) {
    recommendations.push('Optimize API endpoints and database queries for better performance');
  }

  if (performanceMetrics.averageErrorRate > 5) {
    recommendations.push('Review error handling and add more robust error recovery');
  }

  // System recommendations
  if (alerts.filter(a => a.severity === 'critical').length > 0) {
    recommendations.push('Address critical system issues immediately');
  }

  if (alerts.length > 5) {
    recommendations.push('Review system configuration to reduce alert volume');
  }

  if (recommendations.length === 0) {
    recommendations.push('System is operating optimally - continue monitoring');
  }

  return recommendations;
}
