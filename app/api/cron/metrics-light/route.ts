/**
 * Light Metrics Cron Job (Every 15 minutes)
 * Fast calculations: Popular content, active users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveClients, setCachedMetric } from '@/lib/utils/metrics/metricsCache';
import { calculatePopularContent } from '@/lib/utils/metrics/popularContent';

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
        
      } catch (error) {
        const errorMsg = `Client ${clientId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ [Light Metrics] ${errorMsg}`);
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
