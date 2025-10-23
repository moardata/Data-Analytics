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
 * Calculate popular content for today
 */
export async function calculatePopularContent(clientId: string): Promise<PopularContent> {
  // Get today's date range
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all activity events from today
  const { data: todayEvents, error: todayError } = await supabase
    .from('events')
    .select('entity_id, created_at, event_data, event_type')
    .eq('client_id', clientId)
    .in('event_type', ['activity', 'engagement', 'course_enrollment'])
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString());

  if (todayError || !todayEvents || todayEvents.length === 0) {
    return getEmptyPopularContent();
  }

  // Get yesterday's data for trend calculation
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday);
  startOfYesterday.setHours(0, 0, 0, 0);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  const { data: yesterdayEvents } = await supabase
    .from('events')
    .select('entity_id, created_at, event_data, event_type')
    .eq('client_id', clientId)
    .in('event_type', ['activity', 'engagement', 'course_enrollment'])
    .gte('created_at', startOfYesterday.toISOString())
    .lte('created_at', endOfYesterday.toISOString());

  // Analyze today's content
  const todayAnalysis = analyzeContentEngagement(todayEvents);
  const yesterdayAnalysis = yesterdayEvents ? analyzeContentEngagement(yesterdayEvents) : new Map();

  // Calculate trends and format results
  const content = Array.from(todayAnalysis.entries()).map(([expId, data]) => {
    const yesterdayData = yesterdayAnalysis.get(expId) || { engagements: 0, uniqueStudents: 0 };
    const trend = calculateTrend(data.engagements, yesterdayData.engagements);

    return {
      experienceId: expId,
      name: formatContentName(expId),
      engagements: data.engagements,
      uniqueStudents: data.uniqueStudents,
      trend
    };
  }).sort((a, b) => b.engagements - a.engagements);

  // Calculate totals
  const totalEngagements = todayEvents.length;
  const totalUniqueStudents = new Set(todayEvents.map(e => e.entity_id)).size;

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
 * Calculate trend percentage
 */
function calculateTrend(todayValue: number, yesterdayValue: number): string {
  if (yesterdayValue === 0) {
    return todayValue > 0 ? '+100%' : '0%';
  }

  const change = ((todayValue - yesterdayValue) / yesterdayValue) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${Math.round(change * 10) / 10}%`;
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
