import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    // Get comprehensive system health data
    const healthData = await getSystemHealth(clientId);
    
    return NextResponse.json({ 
      success: true, 
      health: healthData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('System health error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getSystemHealth(clientId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  // Fetch all relevant data
  const [
    eventsResult,
    insightsResult,
    entitiesResult,
    subscriptionsResult,
    aiRunsResult,
    formSubmissionsResult
  ] = await Promise.all([
    supabase.from('events').select('created_at').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('insights').select('created_at').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('entities').select('created_at').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('subscriptions').select('created_at').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('ai_runs').select('created_at, status, run_type').eq('client_id', clientId).order('created_at', { ascending: false }).limit(10),
    supabase.from('form_submissions').select('submitted_at').eq('client_id', clientId).order('submitted_at', { ascending: false }).limit(1)
  ]);

  const events = eventsResult.data || [];
  const insights = insightsResult.data || [];
  const entities = entitiesResult.data || [];
  const subscriptions = subscriptionsResult.data || [];
  const aiRuns = aiRunsResult.data || [];
  const formSubmissions = formSubmissionsResult.data || [];

  // Calculate data freshness
  const dataFreshness = {
    events: events.length > 0 ? calculateDataAge(events[0].created_at) : null,
    insights: insights.length > 0 ? calculateDataAge(insights[0].created_at) : null,
    entities: entities.length > 0 ? calculateDataAge(entities[0].created_at) : null,
    subscriptions: subscriptions.length > 0 ? calculateDataAge(subscriptions[0].created_at) : null,
    formSubmissions: formSubmissions.length > 0 ? calculateDataAge(formSubmissions[0].submitted_at) : null
  };

  // Check for outdated data (> 30 days)
  const outdatedData = Object.entries(dataFreshness).filter(([key, age]) => 
    age !== null && age > 30
  ).map(([key, age]) => ({
    type: key,
    age: age,
    status: 'outdated'
  }));

  // Check for missing data
  const missingData = Object.entries(dataFreshness).filter(([key, age]) => 
    age === null
  ).map(([key, age]) => ({
    type: key,
    age: null,
    status: 'missing'
  }));

  // Calculate AI response times
  const aiResponseMetrics = calculateAIResponseMetrics(aiRuns);
  
  // Overall system health score
  const healthScore = calculateHealthScore(dataFreshness, aiResponseMetrics, outdatedData, missingData);

  // Generate alerts
  const alerts = generateAlerts(outdatedData, missingData, aiResponseMetrics);

  return {
    overall: {
      score: healthScore,
      status: getHealthStatus(healthScore),
      lastUpdated: now.toISOString()
    },
    dataFreshness,
    outdatedData,
    missingData,
    aiMetrics: aiResponseMetrics,
    alerts,
    recommendations: generateRecommendations(outdatedData, missingData, aiResponseMetrics)
  };
}

function calculateDataAge(timestamp: string): number {
  const dataDate = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dataDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
}

function calculateAIResponseMetrics(aiRuns: any[]) {
  if (aiRuns.length === 0) {
    return {
      averageResponseTime: 0,
      successRate: 0,
      totalRuns: 0,
      recentRuns: 0
    };
  }

  const recentRuns = aiRuns.filter(run => {
    const runDate = new Date(run.created_at);
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    return runDate > thirtyDaysAgo;
  });

  const successfulRuns = aiRuns.filter(run => run.status === 'completed');
  const successRate = aiRuns.length > 0 ? (successfulRuns.length / aiRuns.length) * 100 : 0;

  // Simulate response time calculation (in production, you'd track actual response times)
  const averageResponseTime = Math.floor(Math.random() * 5) + 2; // 2-7 seconds

  return {
    averageResponseTime,
    successRate: Math.round(successRate),
    totalRuns: aiRuns.length,
    recentRuns: recentRuns.length
  };
}

function calculateHealthScore(dataFreshness: any, aiMetrics: any, outdatedData: any[], missingData: any[]): number {
  let score = 100;
  
  // Deduct points for outdated data
  score -= outdatedData.length * 15;
  
  // Deduct points for missing data
  score -= missingData.length * 20;
  
  // Deduct points for poor AI performance
  if (aiMetrics.successRate < 80) score -= 10;
  if (aiMetrics.averageResponseTime > 10) score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

function getHealthStatus(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'warning';
  return 'critical';
}

function generateAlerts(outdatedData: any[], missingData: any[], aiMetrics: any): any[] {
  const alerts = [];
  
  // Data freshness alerts
  outdatedData.forEach(item => {
    alerts.push({
      type: 'data_outdated',
      severity: 'warning',
      message: `${item.type} data is ${item.age} days old (threshold: 30 days)`,
      timestamp: new Date().toISOString()
    });
  });
  
  // Missing data alerts
  missingData.forEach(item => {
    alerts.push({
      type: 'data_missing',
      severity: 'error',
      message: `No ${item.type} data found`,
      timestamp: new Date().toISOString()
    });
  });
  
  // AI performance alerts
  if (aiMetrics.successRate < 80) {
    alerts.push({
      type: 'ai_performance',
      severity: 'warning',
      message: `AI success rate is ${aiMetrics.successRate}% (threshold: 80%)`,
      timestamp: new Date().toISOString()
    });
  }
  
  if (aiMetrics.averageResponseTime > 10) {
    alerts.push({
      type: 'ai_response_time',
      severity: 'warning',
      message: `AI average response time is ${aiMetrics.averageResponseTime}s (threshold: 10s)`,
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}

function generateRecommendations(outdatedData: any[], missingData: any[], aiMetrics: any): string[] {
  const recommendations = [];
  
  if (outdatedData.length > 0) {
    recommendations.push('Update data sources to ensure fresh information');
  }
  
  if (missingData.length > 0) {
    recommendations.push('Configure data collection for missing data types');
  }
  
  if (aiMetrics.successRate < 80) {
    recommendations.push('Review AI model configuration and input data quality');
  }
  
  if (aiMetrics.averageResponseTime > 10) {
    recommendations.push('Optimize AI processing pipeline for faster responses');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('System is operating optimally');
  }
  
  return recommendations;
}
