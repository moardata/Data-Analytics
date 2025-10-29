/**
 * Medium Metrics Cron Job (Every hour)
 * Moderate complexity: Consistency scores, commitment scores
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveClients, setCachedMetric } from '@/lib/utils/metrics/metricsCache';
import { calculateConsistencyScore } from '@/lib/utils/metrics/consistencyScore';
import { calculateCommitmentScore } from '@/lib/utils/metrics/commitmentScore';

export async function GET(request: NextRequest) {
  try {
    
    // Get all active clients
    const clientIds = await getActiveClients();
    
    if (clientIds.length === 0) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'No active clients',
        processed: 0 
      });
    }

    let processed = 0;
    const errors: string[] = [];

    // Process each client
    for (const clientId of clientIds) {
      try {
        
        // Calculate engagement consistency
        const consistencyScore = await calculateConsistencyScore(clientId);
        await setCachedMetric(
          clientId,
          'engagement_consistency',
          consistencyScore,
          70, // Cache for 70 minutes
          { calculated_at: new Date().toISOString() }
        );
        
        // Calculate commitment scores
        const commitmentScore = await calculateCommitmentScore(clientId);
        await setCachedMetric(
          clientId,
          'commitment_scores',
          commitmentScore,
          70, // Cache for 70 minutes
          { calculated_at: new Date().toISOString() }
        );
        
        processed++;
        
      } catch (error) {
        const errorMsg = `Client ${clientId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ [Medium Metrics] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    
    return NextResponse.json({
      status: 'success',
      processed,
      total: clientIds.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Medium Metrics] Fatal error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
