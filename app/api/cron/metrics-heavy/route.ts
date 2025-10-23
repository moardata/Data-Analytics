/**
 * Heavy Metrics Cron Job (Every 6 hours)
 * Complex calculations: Pathway analysis, aha moments, feedback themes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveClients, setCachedMetric, cleanupExpiredMetrics } from '@/lib/utils/metrics/metricsCache';
import { calculateAhaMomentScore } from '@/lib/utils/metrics/ahaMoment';
import { calculateContentPathways } from '@/lib/utils/metrics/contentPathways';
import { calculateFeedbackThemes } from '@/lib/utils/metrics/feedbackThemes';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 [Heavy Metrics] Starting 6-hour sync...');
    
    // Clean up expired metrics first
    const cleanedCount = await cleanupExpiredMetrics();
    console.log(`🧹 [Heavy Metrics] Cleaned up ${cleanedCount} expired metrics`);
    
    // Get all active clients
    const clientIds = await getActiveClients();
    
    if (clientIds.length === 0) {
      console.log('📊 [Heavy Metrics] No active clients found');
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
        console.log(`📊 [Heavy Metrics] Processing client ${clientId}...`);
        
        // Calculate aha moments
        const ahaMoments = await calculateAhaMomentScore(clientId);
        await setCachedMetric(
          clientId,
          'aha_moments',
          ahaMoments,
          360, // Cache for 6 hours
          { calculated_at: new Date().toISOString() }
        );
        
        // Calculate content pathways
        const contentPathways = await calculateContentPathways(clientId);
        await setCachedMetric(
          clientId,
          'content_pathways',
          contentPathways,
          360, // Cache for 6 hours
          { calculated_at: new Date().toISOString() }
        );
        
        // Calculate feedback themes
        const feedbackThemes = await calculateFeedbackThemes(clientId);
        await setCachedMetric(
          clientId,
          'feedback_themes',
          feedbackThemes,
          360, // Cache for 6 hours
          { calculated_at: new Date().toISOString() }
        );
        
        processed++;
        console.log(`✅ [Heavy Metrics] Cached aha moments, pathways & themes for client ${clientId}`);
        
      } catch (error) {
        const errorMsg = `Client ${clientId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ [Heavy Metrics] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`🎉 [Heavy Metrics] Completed: ${processed}/${clientIds.length} clients processed`);
    
    return NextResponse.json({
      status: 'success',
      processed,
      total: clientIds.length,
      cleanedExpired: cleanedCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Heavy Metrics] Fatal error:', error);
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
