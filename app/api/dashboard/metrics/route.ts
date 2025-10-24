/**
 * Dashboard Metrics API
 * GET: Returns all cached dashboard metrics for a client
 * POST: Force-refreshes all metrics (sync operation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrCalculateMetric, invalidateMetric, setCachedMetric } from '@/lib/utils/metrics/metricsCache';
import { calculateConsistencyScore } from '@/lib/utils/metrics/consistencyScore';
import { calculateAhaMomentScore } from '@/lib/utils/metrics/ahaMoment';
import { calculateContentPathways } from '@/lib/utils/metrics/contentPathways';
import { calculatePopularContent } from '@/lib/utils/metrics/popularContent';
import { calculateFeedbackThemes } from '@/lib/utils/metrics/feedbackThemes';
import { calculateCommitmentScore } from '@/lib/utils/metrics/commitmentScore';

/**
 * Convert time range string to days
 */
function getTimeRangeDays(timeRange: string): number {
  switch (timeRange) {
    case '1D': return 1;
    case '7D': return 7;
    case '1M': return 30;
    default: return 7;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const timeRange = searchParams.get('timeRange') || '7D'; // Default to 7 days

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId parameter is required' },
        { status: 400 }
      );
    }

    console.log(`📊 [Dashboard API] Fetching metrics for client ${clientId} with time range ${timeRange}...`);

    const days = getTimeRangeDays(timeRange);

    // Get all metrics with cache-first strategy
    // Note: For now, we calculate all metrics fresh since the calculation functions
    // don't yet support time range filtering. Future enhancement: pass timeRange to each function.
    const [
      engagementConsistency,
      ahaMoments,
      contentPathways,
      popularContent,
      feedbackThemes,
      commitmentScores
    ] = await Promise.all([
      calculateConsistencyScore(clientId),
      calculateAhaMomentScore(clientId),
      calculateContentPathways(clientId),
      calculatePopularContent(clientId),
      calculateFeedbackThemes(clientId),
      calculateCommitmentScore(clientId)
    ]);

    // Build response
    const response = {
      engagementConsistency: engagementConsistency || {
        averageScore: 0,
        distribution: { high: 0, medium: 0, low: 0 },
        trend: '0%',
        studentScores: []
      },
      ahaMoments: ahaMoments || {
        topExperiences: [],
        avgTimeToFirstBreakthrough: 'N/A',
        stagnantStudents: 0,
        stagnantStudentsList: []
      },
      contentPathways: contentPathways || {
        topPathways: [],
        deadEnds: [],
        powerCombinations: []
      },
      popularContent: popularContent || {
        content: [],
        totalEngagements: 0,
        totalUniqueStudents: 0,
        lastUpdated: new Date().toISOString()
      },
      feedbackThemes: feedbackThemes || {
        hasData: false,
        themes: [],
        totalSubmissions: 0,
        lastUpdated: new Date().toISOString(),
        ctaMessage: 'No feedback data available'
      },
      commitmentScores: commitmentScores || {
        averageScore: 0,
        distribution: { high: 0, medium: 0, atRisk: 0 },
        atRiskStudents: [],
        totalStudents: 0
      },
      metadata: {
        clientId,
        timeRange,
        generatedAt: new Date().toISOString(),
        cacheStatus: {
          engagementConsistency: !!engagementConsistency,
          ahaMoments: !!ahaMoments,
          contentPathways: !!contentPathways,
          popularContent: !!popularContent,
          feedbackThemes: !!feedbackThemes,
          commitmentScores: !!commitmentScores
        }
      }
    };

    console.log(`✅ [Dashboard API] Successfully fetched metrics for client ${clientId}`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [Dashboard API] Error fetching metrics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to force-refresh all metrics (Sync Data)
 * Invalidates all cached metrics and recalculates them
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId parameter is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 [Dashboard Sync] Force-refreshing all metrics for client ${clientId}...`);

    // Step 1: Invalidate all cached metrics
    const metricTypes = [
      'engagement_consistency',
      'aha_moments',
      'content_pathways',
      'popular_content_daily',
      'feedback_themes',
      'commitment_scores'
    ] as const;

    await Promise.all(
      metricTypes.map(type => invalidateMetric(clientId, type))
    );

    console.log(`🗑️  [Dashboard Sync] Invalidated all cached metrics for client ${clientId}`);

    // Step 2: Recalculate all metrics fresh
    const [
      engagementConsistency,
      ahaMoments,
      contentPathways,
      popularContent,
      feedbackThemes,
      commitmentScores
    ] = await Promise.all([
      calculateConsistencyScore(clientId),
      calculateAhaMomentScore(clientId),
      calculateContentPathways(clientId),
      calculatePopularContent(clientId),
      calculateFeedbackThemes(clientId),
      calculateCommitmentScore(clientId)
    ]);

    // Step 3: Store freshly calculated metrics in cache
    await Promise.all([
      setCachedMetric(clientId, 'engagement_consistency', engagementConsistency, 60),
      setCachedMetric(clientId, 'aha_moments', ahaMoments, 360),
      setCachedMetric(clientId, 'content_pathways', contentPathways, 360),
      setCachedMetric(clientId, 'popular_content_daily', popularContent, 20),
      setCachedMetric(clientId, 'feedback_themes', feedbackThemes, 360),
      setCachedMetric(clientId, 'commitment_scores', commitmentScores, 60)
    ]);

    // Build response
    const response = {
      engagementConsistency: engagementConsistency || {
        averageScore: 0,
        distribution: { high: 0, medium: 0, low: 0 },
        trend: '0%',
        studentScores: []
      },
      ahaMoments: ahaMoments || {
        topExperiences: [],
        avgTimeToFirstBreakthrough: 'N/A',
        stagnantStudents: 0,
        stagnantStudentsList: []
      },
      contentPathways: contentPathways || {
        topPathways: [],
        deadEnds: [],
        powerCombinations: []
      },
      popularContent: popularContent || {
        content: [],
        totalEngagements: 0,
        totalUniqueStudents: 0,
        lastUpdated: new Date().toISOString()
      },
      feedbackThemes: feedbackThemes || {
        hasData: false,
        themes: [],
        totalSubmissions: 0,
        lastUpdated: new Date().toISOString(),
        ctaMessage: 'No feedback data available'
      },
      commitmentScores: commitmentScores || {
        averageScore: 0,
        distribution: { high: 0, medium: 0, atRisk: 0 },
        atRiskStudents: [],
        totalStudents: 0
      },
      metadata: {
        clientId,
        generatedAt: new Date().toISOString(),
        synced: true,
        cacheStatus: {
          engagementConsistency: true,
          ahaMoments: true,
          contentPathways: true,
          popularContent: true,
          feedbackThemes: true,
          commitmentScores: true
        }
      }
    };

    console.log(`✅ [Dashboard Sync] Successfully synced all metrics for client ${clientId}`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [Dashboard Sync] Error syncing metrics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync dashboard metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
