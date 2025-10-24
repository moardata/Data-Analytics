/**
 * Metrics Caching System
 * Handles storing, retrieving, and managing cached dashboard metrics
 */

import { supabaseServer as supabase } from '@/lib/supabase-server';

export type MetricType = 
  | 'engagement_consistency'
  | 'aha_moments'
  | 'content_pathways'
  | 'popular_content_daily'
  | 'feedback_themes'
  | 'commitment_scores';

export interface CachedMetric {
  id: string;
  client_id: string;
  metric_type: MetricType;
  metric_data: any;
  calculated_at: string;
  expires_at: string;
  metadata?: Record<string, any>;
}

/**
 * Get cached metric if still valid
 */
export async function getCachedMetric(
  clientId: string,
  metricType: MetricType
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('cached_dashboard_metrics')
      .select('*')
      .eq('client_id', clientId)
      .eq('metric_type', metricType)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    console.log(`✅ Cache HIT for ${metricType} (client: ${clientId})`);
    return data.metric_data;
  } catch (error) {
    console.error(`Error getting cached metric ${metricType}:`, error);
    return null;
  }
}

/**
 * Store calculated metric in cache
 */
export async function setCachedMetric(
  clientId: string,
  metricType: MetricType,
  metricData: any,
  ttlMinutes: number,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    const { error } = await supabase
      .from('cached_dashboard_metrics')
      .upsert({
        client_id: clientId,
        metric_type: metricType,
        metric_data: metricData,
        calculated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        metadata: metadata || {}
      }, {
        onConflict: 'client_id,metric_type'
      });

    if (error) {
      console.error(`Error caching metric ${metricType}:`, error);
      return false;
    }

    console.log(`💾 Cached ${metricType} for client ${clientId} (TTL: ${ttlMinutes}min)`);
    return true;
  } catch (error) {
    console.error(`Error caching metric ${metricType}:`, error);
    return false;
  }
}

/**
 * Get or calculate metric with automatic caching
 */
export async function getOrCalculateMetric<T>(
  clientId: string,
  metricType: MetricType,
  calculator: (clientId: string) => Promise<T>,
  ttlMinutes: number
): Promise<T | null> {
  // Try cache first
  const cached = await getCachedMetric(clientId, metricType);
  if (cached !== null) {
    return cached as T;
  }

  // Cache miss - calculate
  console.log(`⚡ Cache MISS for ${metricType} - calculating...`);
  try {
    const calculated = await calculator(clientId);
    
    // Store in cache
    await setCachedMetric(clientId, metricType, calculated, ttlMinutes);
    
    return calculated;
  } catch (error) {
    console.error(`Error calculating metric ${metricType}:`, error);
    return null;
  }
}

/**
 * Invalidate cached metric
 */
export async function invalidateMetric(
  clientId: string,
  metricType: MetricType
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cached_dashboard_metrics')
      .delete()
      .eq('client_id', clientId)
      .eq('metric_type', metricType);

    if (error) {
      console.error(`Error invalidating metric ${metricType}:`, error);
      return false;
    }

    console.log(`🗑️  Invalidated cache for ${metricType} (client: ${clientId})`);
    return true;
  } catch (error) {
    console.error(`Error invalidating metric ${metricType}:`, error);
    return false;
  }
}

/**
 * Clean up expired metrics (call from cron)
 */
export async function cleanupExpiredMetrics(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('cached_dashboard_metrics')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('Error cleaning up expired metrics:', error);
      return 0;
    }

    const count = data?.length || 0;
    if (count > 0) {
      console.log(`🧹 Cleaned up ${count} expired metrics`);
    }
    return count;
  } catch (error) {
    console.error('Error cleaning up expired metrics:', error);
    return 0;
  }
}

/**
 * Get all active clients for batch processing
 */
export async function getActiveClients(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .eq('subscription_status', 'active');

    if (error || !data) {
      console.error('Error fetching active clients:', error);
      return [];
    }

    return data.map(c => c.id);
  } catch (error) {
    console.error('Error fetching active clients:', error);
    return [];
  }
}

