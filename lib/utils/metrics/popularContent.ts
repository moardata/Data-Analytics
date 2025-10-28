/**
 * Popular Content Today
 * Real-time daily engagement tracking by content/module
 */

import { supabaseServer as supabase } from '@/lib/supabase-server';

export interface PopularContent {
  content: Array<{
    experienceId: string;
    name: string;
    engagements: number;
    uniqueStudents: number;
    trend: string; // e.g., "+12%"
  }>;
  totalEngagements: number;
  totalUniqueStudents: number;
  lastUpdated: string;
}

/**
 * Calculate popular content for specified time range
 * @param clientId - Client UUID
 * @param days - Number of days to look back (default 7)
 */
export async function calculatePopularContent(clientId: string, days: number = 7): Promise<PopularContent> {
  // Calculate date range
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  console.log(`📊 [Popular Content] Calculating for ${days} days, from ${startDate.toISOString()}`);

  // Get ALL events in the time range (not just specific types)
  const { data: currentEvents, error: currentError } = await supabase
    .from('events')
    .select('entity_id, created_at, event_data, event_type')
    .eq('client_id', clientId)
    .gte('created_at', startDate.toISOString());

  console.log(`📊 [Popular Content] Found ${currentEvents?.length || 0} total events`);

  if (currentError || !currentEvents || currentEvents.length === 0) {
    console.log('⚠️ [Popular Content] No events found, returning empty');
    return getEmptyPopularContent();
  }

  // Get comparison period data for trend (previous period)
  const comparisonStart = new Date(startDate);
  comparisonStart.setDate(comparisonStart.getDate() - days);
  const comparisonEnd = new Date(startDate);

  const { data: comparisonEvents } = await supabase
    .from('events')
    .select('entity_id, created_at, event_data, event_type')
    .eq('client_id', clientId)
    .gte('created_at', comparisonStart.toISOString())
    .lt('created_at', comparisonEnd.toISOString());

  // Analyze current period content
  const currentAnalysis = analyzeContentEngagement(currentEvents);
  const comparisonAnalysis = comparisonEvents ? analyzeContentEngagement(comparisonEvents) : new Map();

  // Calculate trends and format results
  const content = Array.from(currentAnalysis.entries()).map(([expId, data]) => {
    const comparisonData = comparisonAnalysis.get(expId) || { engagements: 0, uniqueStudents: new Set() };
    const trend = calculateTrend(data.engagements, comparisonData.engagements);

    return {
      experienceId: expId,
      name: formatContentName(expId),
      engagements: data.engagements,
      uniqueStudents: data.uniqueStudents.size,
      trend
    };
  }).sort((a, b) => b.engagements - a.engagements);

  // Calculate totals
  const totalEngagements = currentEvents.length;
  const totalUniqueStudents = new Set(currentEvents.map(e => e.entity_id)).size;

  console.log(`✅ [Popular Content] Total: ${totalEngagements} engagements, ${totalUniqueStudents} unique students`);

  return {
    content: content.slice(0, 10), // Top 10
    totalEngagements,
    totalUniqueStudents,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Analyze content engagement from events
 */
function analyzeContentEngagement(events: any[]): Map<string, {
  engagements: number;
  uniqueStudents: Set<string>;
}> {
  const contentMap = new Map<string, {
    engagements: number;
    uniqueStudents: Set<string>;
  }>();

  events.forEach(event => {
    const expId = event.event_data?.experience_id || event.event_data?.action || 'unknown';
    
    if (!contentMap.has(expId)) {
      contentMap.set(expId, {
        engagements: 0,
        uniqueStudents: new Set()
      });
    }

    const data = contentMap.get(expId)!;
    data.engagements++;
    data.uniqueStudents.add(event.entity_id);
  });

  return contentMap;
}

/**
 * Calculate trend percentage (capped at reasonable values)
 */
function calculateTrend(todayValue: number, yesterdayValue: number): string {
  if (yesterdayValue === 0 && todayValue === 0) {
    return '0%';
  }
  
  if (yesterdayValue === 0) {
    return 'New';
  }

  const change = ((todayValue - yesterdayValue) / yesterdayValue) * 100;
  
  // Cap at +/-999% for display sanity
  const cappedChange = Math.max(-999, Math.min(999, change));
  
  const sign = cappedChange >= 0 ? '+' : '';
  return `${sign}${Math.round(cappedChange * 10) / 10}%`;
}

/**
 * Format content name for display
 */
function formatContentName(expId: string): string {
  if (expId === 'unknown') return 'Unknown Content';
  
  return expId
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Empty popular content data
 */
function getEmptyPopularContent(): PopularContent {
  return {
    content: [],
    totalEngagements: 0,
    totalUniqueStudents: 0,
    lastUpdated: new Date().toISOString()
  };
}
