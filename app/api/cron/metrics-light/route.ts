/**
 * Light Metrics Cron Job (Every 15 minutes)
 * Fast calculations: Popular content, active users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveClients, setCachedMetric } from '@/lib/utils/metrics/metricsCache';
import { calculatePopularContent } from '@/lib/utils/metrics/popularContent';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 [Light Metrics] Starting 15-minute sync...');
    
    // Get all active clients
    const clientIds = await getActiveClients();
    
    if (clientIds.length === 0) {
      console.log('📊 [Light Metrics] No active clients found');
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
        console.log(`📊 [Light Metrics] Processing client ${clientId}...`);
        
        // Calculate popular content
        const popularContent = await calculatePopularContent(clientId);
        
        // Cache for 20 minutes (slightly longer than cron interval)
        await setCachedMetric(
          clientId,
          'popular_content_daily',
          popularContent,
          20,
          { calculated_at: new Date().toISOString() }
        );
        
        processed++;
        console.log(`✅ [Light Metrics] Cached popular content for client ${clientId}`);
        
      } catch (error) {
        const errorMsg = `Client ${clientId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ [Light Metrics] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`🎉 [Light Metrics] Completed: ${processed}/${clientIds.length} clients processed`);
    
    return NextResponse.json({
      status: 'success',
      processed,
      total: clientIds.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Light Metrics] Fatal error:', error);
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
