/**
 * Dashboard Metrics API
 * Returns all cached dashboard metrics for a client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrCalculateMetric } from '@/lib/utils/metrics/metricsCache';
import { calculateConsistencyScore } from '@/lib/utils/metrics/consistencyScore';
import { calculateAhaMomentScore } from '@/lib/utils/metrics/ahaMoment';
import { calculateContentPathways } from '@/lib/utils/metrics/contentPathways';
import { calculatePopularContent } from '@/lib/utils/metrics/popularContent';
import { calculateFeedbackThemes } from '@/lib/utils/metrics/feedbackThemes';
import { calculateCommitmentScore } from '@/lib/utils/metrics/commitmentScore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId parameter is required' },
        { status: 400 }
      );
    }

    console.log(`📊 [Dashboard API] Fetching metrics for client ${clientId}...`);

    // Get all metrics with cache-first strategy
    const [
      engagementConsistency,
      ahaMoments,
      contentPathways,
      popularContent,
      feedbackThemes,
      commitmentScores
    ] = await Promise.all([
      getOrCalculateMetric(
        clientId,
        'engagement_consistency',
        calculateConsistencyScore,
        60 // 1 hour TTL
      ),
      getOrCalculateMetric(
        clientId,
        'aha_moments',
        calculateAhaMomentScore,
        360 // 6 hours TTL
      ),
      getOrCalculateMetric(
        clientId,
        'content_pathways',
        calculateContentPathways,
        360 // 6 hours TTL
      ),
      getOrCalculateMetric(
        clientId,
        'popular_content_daily',
        calculatePopularContent,
        20 // 20 minutes TTL
      ),
      getOrCalculateMetric(
        clientId,
        'feedback_themes',
        calculateFeedbackThemes,
        360 // 6 hours TTL
      ),
      getOrCalculateMetric(
        clientId,
        'commitment_scores',
        calculateCommitmentScore,
        60 // 1 hour TTL
      )
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
