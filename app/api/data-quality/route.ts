/**
 * Data Quality Monitoring API
 * Provides comprehensive data quality metrics and health checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';
import { calculateDataQuality, validateEventData, validateFormSubmission, validateEntity, validateSubscription } from '@/lib/validation/data-schemas';

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

    // Get data quality metrics for all data types
    const qualityMetrics = await getDataQualityMetrics(clientId);

    return NextResponse.json({
      success: true,
      clientId,
      companyId,
      qualityMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Data quality monitoring error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getDataQualityMetrics(clientId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch recent data for quality analysis
  const [eventsResult, submissionsResult, entitiesResult, subscriptionsResult] = await Promise.all([
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
      .limit(1000)
  ]);

  const events = eventsResult.data || [];
  const submissions = submissionsResult.data || [];
  const entities = entitiesResult.data || [];
  const subscriptions = subscriptionsResult.data || [];

  // Calculate quality scores
  const eventsQuality = calculateDataQuality(events);
  const submissionsQuality = calculateDataQuality(submissions);
  const entitiesQuality = calculateDataQuality(entities);
  const subscriptionsQuality = calculateDataQuality(subscriptions);

  // Validate sample data
  const validationResults = {
    events: events.slice(0, 10).map(validateEventData),
    submissions: submissions.slice(0, 10).map(validateFormSubmission),
    entities: entities.slice(0, 10).map(validateEntity),
    subscriptions: subscriptions.slice(0, 10).map(validateSubscription)
  };

  // Calculate validation error rates
  const validationErrorRates = {
    events: (validationResults.events.filter(r => !r.isValid).length / validationResults.events.length) * 100,
    submissions: (validationResults.submissions.filter(r => !r.isValid).length / validationResults.submissions.length) * 100,
    entities: (validationResults.entities.filter(r => !r.isValid).length / validationResults.entities.length) * 100,
    subscriptions: (validationResults.subscriptions.filter(r => !r.isValid).length / validationResults.subscriptions.length) * 100
  };

  // Data freshness analysis
  const freshnessAnalysis = {
    events: {
      total: events.length,
      last7Days: events.filter(e => new Date(e.created_at) > sevenDaysAgo).length,
      last30Days: events.length,
      oldestRecord: events.length > 0 ? events[events.length - 1].created_at : null,
      newestRecord: events.length > 0 ? events[0].created_at : null
    },
    submissions: {
      total: submissions.length,
      last7Days: submissions.filter(s => new Date(s.submitted_at) > sevenDaysAgo).length,
      last30Days: submissions.length,
      oldestRecord: submissions.length > 0 ? submissions[submissions.length - 1].submitted_at : null,
      newestRecord: submissions.length > 0 ? submissions[0].submitted_at : null
    },
    entities: {
      total: entities.length,
      last7Days: entities.filter(e => new Date(e.created_at) > sevenDaysAgo).length,
      last30Days: entities.filter(e => new Date(e.created_at) > thirtyDaysAgo).length,
      oldestRecord: entities.length > 0 ? entities[entities.length - 1].created_at : null,
      newestRecord: entities.length > 0 ? entities[0].created_at : null
    },
    subscriptions: {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      expired: subscriptions.filter(s => s.status === 'expired').length
    }
  };

  // Generate quality alerts
  const alerts = [];
  
  // Data completeness alerts
  if (eventsQuality.completeness < 90) {
    alerts.push({
      type: 'data_completeness',
      severity: 'warning',
      message: `Events data completeness is ${eventsQuality.completeness}% (threshold: 90%)`,
      dataType: 'events'
    });
  }

  if (submissionsQuality.completeness < 90) {
    alerts.push({
      type: 'data_completeness',
      severity: 'warning',
      message: `Form submissions completeness is ${submissionsQuality.completeness}% (threshold: 90%)`,
      dataType: 'submissions'
    });
  }

  // Data freshness alerts
  if (freshnessAnalysis.events.last7Days === 0 && events.length > 0) {
    alerts.push({
      type: 'data_freshness',
      severity: 'error',
      message: 'No events data in the last 7 days',
      dataType: 'events'
    });
  }

  if (freshnessAnalysis.submissions.last7Days === 0 && submissions.length > 0) {
    alerts.push({
      type: 'data_freshness',
      severity: 'error',
      message: 'No form submissions in the last 7 days',
      dataType: 'submissions'
    });
  }

  // Validation error alerts
  if (validationErrorRates.events > 5) {
    alerts.push({
      type: 'data_validation',
      severity: 'error',
      message: `Events validation error rate is ${validationErrorRates.events.toFixed(1)}% (threshold: 5%)`,
      dataType: 'events'
    });
  }

  if (validationErrorRates.submissions > 5) {
    alerts.push({
      type: 'data_validation',
      severity: 'error',
      message: `Form submissions validation error rate is ${validationErrorRates.submissions.toFixed(1)}% (threshold: 5%)`,
      dataType: 'submissions'
    });
  }

  // Overall system health score
  const overallHealthScore = Math.round(
    (eventsQuality.overall + submissionsQuality.overall + entitiesQuality.overall + subscriptionsQuality.overall) / 4
  );

  // Build quality scores object
  const qualityScores = {
    events: eventsQuality,
    submissions: submissionsQuality,
    entities: entitiesQuality,
    subscriptions: subscriptionsQuality
  };

  return {
    overallHealth: {
      score: overallHealthScore,
      status: overallHealthScore >= 90 ? 'excellent' : overallHealthScore >= 70 ? 'good' : overallHealthScore >= 50 ? 'warning' : 'critical'
    },
    qualityScores,
    validationErrorRates,
    freshnessAnalysis,
    alerts,
    recommendations: generateQualityRecommendations(qualityScores, validationErrorRates, freshnessAnalysis)
  };
}

function generateQualityRecommendations(qualityScores: any, validationErrorRates: any, freshnessAnalysis: any): string[] {
  const recommendations = [];

  // Data completeness recommendations
  if (qualityScores.events.completeness < 90) {
    recommendations.push('Review event data collection to ensure all required fields are captured');
  }

  if (qualityScores.submissions.completeness < 90) {
    recommendations.push('Check form submission process to ensure all data is properly saved');
  }

  // Data freshness recommendations
  if (freshnessAnalysis.events.last7Days === 0) {
    recommendations.push('Investigate why no events are being recorded - check webhook configuration');
  }

  if (freshnessAnalysis.submissions.last7Days === 0) {
    recommendations.push('Check if surveys are being distributed and if students are responding');
  }

  // Validation recommendations
  if (validationErrorRates.events > 5) {
    recommendations.push('Review event data format and ensure proper validation on data entry');
  }

  if (validationErrorRates.submissions > 5) {
    recommendations.push('Check form field validation and ensure proper data types are being collected');
  }

  if (recommendations.length === 0) {
    recommendations.push('Data quality is excellent - continue monitoring for any changes');
  }

  return recommendations;
}
