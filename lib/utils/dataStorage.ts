/**
 * Enhanced Data Storage System
 * Manages insights storage with timestamps, metadata, and progress tracking
 */

import { supabaseServer as supabase } from '@/lib/supabase-server';

export interface InsightStorageData {
  clientId: string;
  datasetId?: string;
  title: string;
  content: string;
  insightType: string;
  metadata: {
    confidence: number;
    severity: string;
    dataPoints: number;
    affectedStudents?: number;
    aiGenerated: boolean;
    model: string;
    version: string;
    generationDate: string;
    structuredAnalysis: boolean;
    category?: string;
    status?: string;
    actionTaken?: boolean;
    completedAt?: string;
    viewedAt?: string;
    viewCount?: number;
  };
}

export interface AIRunStorageData {
  clientId: string;
  runType: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  metadata: {
    model: string;
    version: string;
    parameters: Record<string, any>;
    inputDataSize: number;
    outputDataSize: number;
    processingTime: number;
    error?: string;
    datasetId?: string;
    reRunOf?: string;
  };
}

export interface DataStorageHistory {
  id: string;
  timestamp: string;
  totalInsights: number;
  categories: Record<string, number>;
  summary: string;
  datasetId: string;
  model: string;
  version: string;
}

/**
 * Enhanced insights storage with comprehensive metadata
 */
export async function storeInsightWithMetadata(data: InsightStorageData): Promise<string | null> {
  try {
    console.log('💾 [Data Storage] Storing insight with metadata:', {
      clientId: data.clientId,
      title: data.title,
      insightType: data.insightType,
      model: data.metadata.model,
      version: data.metadata.version
    });

    const { data: insight, error } = await supabase
      .from('insights')
      .insert({
        client_id: data.clientId,
        insight_type: data.insightType,
        title: data.title,
        content: data.content,
        metadata: {
          ...data.metadata,
          dataset_id: data.datasetId,
          stored_at: new Date().toISOString(),
          storage_version: '2.0'
        },
        severity: data.metadata.severity,
        dismissed: false
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ [Data Storage] Error storing insight:', error);
      return null;
    }

    console.log('✅ [Data Storage] Insight stored successfully:', insight.id);
    return insight.id;

  } catch (error) {
    console.error('❌ [Data Storage] Error in storeInsightWithMetadata:', error);
    return null;
  }
}

/**
 * Enhanced AI run tracking with comprehensive metadata
 */
export async function trackAIRunWithMetadata(data: AIRunStorageData): Promise<string | null> {
  try {
    console.log('🤖 [Data Storage] Tracking AI run with metadata:', {
      clientId: data.clientId,
      runType: data.runType,
      status: data.status,
      model: data.metadata.model,
      version: data.metadata.version
    });

    const { data: aiRun, error } = await supabase
      .from('ai_runs')
      .insert({
        client_id: data.clientId,
        run_type: data.runType,
        status: data.status,
        started_at: data.status === 'running' ? new Date().toISOString() : null,
        finished_at: data.status === 'completed' || data.status === 'failed' ? new Date().toISOString() : null,
        error: data.metadata.error,
        meta: {
          ...data.metadata,
          tracked_at: new Date().toISOString(),
          tracking_version: '2.0'
        }
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ [Data Storage] Error tracking AI run:', error);
      return null;
    }

    console.log('✅ [Data Storage] AI run tracked successfully:', aiRun.id);
    return aiRun.id;

  } catch (error) {
    console.error('❌ [Data Storage] Error in trackAIRunWithMetadata:', error);
    return null;
  }
}

/**
 * Update AI run status and completion data
 */
export async function updateAIRunStatus(
  runId: string, 
  status: 'running' | 'completed' | 'failed',
  metadata?: Partial<AIRunStorageData['metadata']>
): Promise<boolean> {
  try {
    const updateData: any = {
      status,
      finished_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null
    };

    if (metadata) {
      updateData.meta = {
        ...metadata,
        updated_at: new Date().toISOString()
      };
    }

    const { error } = await supabase
      .from('ai_runs')
      .update(updateData)
      .eq('id', runId);

    if (error) {
      console.error('❌ [Data Storage] Error updating AI run status:', error);
      return false;
    }

    console.log('✅ [Data Storage] AI run status updated:', { runId, status });
    return true;

  } catch (error) {
    console.error('❌ [Data Storage] Error in updateAIRunStatus:', error);
    return false;
  }
}

/**
 * Get insights with comprehensive filtering and metadata
 */
export async function getInsightsWithMetadata(
  clientId: string,
  options: {
    status?: string;
    category?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
    offset?: number;
  } = {}
): Promise<InsightStorageData[]> {
  try {
    let query = supabase
      .from('insights')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options.status) {
      query = query.eq('metadata->status', options.status);
    }

    if (options.category) {
      query = query.eq('metadata->category', options.category);
    }

    if (options.dateRange) {
      query = query
        .gte('created_at', options.dateRange.start)
        .lte('created_at', options.dateRange.end);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: insights, error } = await query;

    if (error) {
      console.error('❌ [Data Storage] Error fetching insights:', error);
      return [];
    }

    return insights?.map(insight => ({
      clientId: insight.client_id,
      datasetId: insight.metadata?.dataset_id,
      title: insight.title,
      content: insight.content,
      insightType: insight.insight_type,
      metadata: {
        confidence: insight.metadata?.confidence || 0,
        severity: insight.severity || 'info',
        dataPoints: insight.metadata?.dataPoints || 0,
        affectedStudents: insight.metadata?.affectedStudents,
        aiGenerated: insight.metadata?.aiGenerated || false,
        model: insight.metadata?.model || 'unknown',
        version: insight.metadata?.version || '1.0',
        generationDate: insight.metadata?.generationDate || insight.created_at,
        structuredAnalysis: insight.metadata?.structuredAnalysis || false,
        category: insight.metadata?.category,
        status: insight.metadata?.status || 'new',
        actionTaken: insight.metadata?.actionTaken || false,
        completedAt: insight.metadata?.completedAt,
        viewedAt: insight.metadata?.viewedAt,
        viewCount: insight.metadata?.viewCount || 0
      }
    })) || [];

  } catch (error) {
    console.error('❌ [Data Storage] Error in getInsightsWithMetadata:', error);
    return [];
  }
}

/**
 * Get data storage history for progress tracking
 */
export async function getDataStorageHistory(
  clientId: string,
  limit: number = 10
): Promise<DataStorageHistory[]> {
  try {
    // Get AI runs with insights count
    const { data: aiRuns, error } = await supabase
      .from('ai_runs')
      .select(`
        id,
        run_type,
        started_at,
        finished_at,
        status,
        meta,
        insights:insights(count)
      `)
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [Data Storage] Error fetching AI runs history:', error);
      return [];
    }

    // Get insights for each run to build history
    const historyPromises = aiRuns?.map(async (run) => {
      const { data: insights } = await supabase
        .from('insights')
        .select('insight_type, metadata')
        .eq('client_id', clientId)
        .gte('created_at', run.started_at)
        .lte('created_at', run.finished_at || new Date().toISOString());

      const categories = insights?.reduce((acc, insight) => {
        const category = insight.metadata?.category || insight.insight_type;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        id: run.id,
        timestamp: run.started_at,
        totalInsights: insights?.length || 0,
        categories,
        summary: `Generated ${insights?.length || 0} insights using ${run.meta?.model || 'AI'} model`,
        datasetId: run.meta?.datasetId || 'unknown',
        model: run.meta?.model || 'unknown',
        version: run.meta?.version || '1.0'
      };
    }) || [];

    const history = await Promise.all(historyPromises);
    return history;

  } catch (error) {
    console.error('❌ [Data Storage] Error in getDataStorageHistory:', error);
    return [];
  }
}

/**
 * Update insight status (mark as done, view details, etc.)
 */
export async function updateInsightStatus(
  insightId: string,
  status: 'new' | 'viewed' | 'done',
  additionalMetadata?: Record<string, any>
): Promise<boolean> {
  try {
    const updateData: any = {
      metadata: {
        status,
        updated_at: new Date().toISOString(),
        ...additionalMetadata
      }
    };

    if (status === 'done') {
      updateData.metadata.completed_at = new Date().toISOString();
      updateData.metadata.action_taken = true;
    } else if (status === 'viewed') {
      updateData.metadata.viewed_at = new Date().toISOString();
      updateData.metadata.view_count = (updateData.metadata.view_count || 0) + 1;
    }

    const { error } = await supabase
      .from('insights')
      .update(updateData)
      .eq('id', insightId);

    if (error) {
      console.error('❌ [Data Storage] Error updating insight status:', error);
      return false;
    }

    console.log('✅ [Data Storage] Insight status updated:', { insightId, status });
    return true;

  } catch (error) {
    console.error('❌ [Data Storage] Error in updateInsightStatus:', error);
    return false;
  }
}

/**
 * Get insights statistics for progress tracking
 */
export async function getInsightsStatistics(clientId: string): Promise<{
  totalInsights: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  recentActivity: number;
  completionRate: number;
}> {
  try {
    const { data: insights, error } = await supabase
      .from('insights')
      .select('insight_type, severity, metadata, created_at')
      .eq('client_id', clientId);

    if (error) {
      console.error('❌ [Data Storage] Error fetching insights statistics:', error);
      return {
        totalInsights: 0,
        byStatus: {},
        byCategory: {},
        bySeverity: {},
        recentActivity: 0,
        completionRate: 0
      };
    }

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      totalInsights: insights?.length || 0,
      byStatus: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      recentActivity: 0,
      completionRate: 0
    };

    insights?.forEach(insight => {
      // Status tracking
      const status = insight.metadata?.status || 'new';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Category tracking
      const category = insight.metadata?.category || insight.insight_type;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Severity tracking
      stats.bySeverity[insight.severity] = (stats.bySeverity[insight.severity] || 0) + 1;

      // Recent activity (last week)
      if (new Date(insight.created_at) > lastWeek) {
        stats.recentActivity++;
      }
    });

    // Calculate completion rate
    const completed = stats.byStatus.done || 0;
    stats.completionRate = stats.totalInsights > 0 ? (completed / stats.totalInsights) * 100 : 0;

    return stats;

  } catch (error) {
    console.error('❌ [Data Storage] Error in getInsightsStatistics:', error);
    return {
      totalInsights: 0,
      byStatus: {},
      byCategory: {},
      bySeverity: {},
      recentActivity: 0,
      completionRate: 0
    };
  }
}
