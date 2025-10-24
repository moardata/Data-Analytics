/**
 * Engagement Consistency Score
 * Measures how consistently students engage week-over-week
 */

import { supabaseServer as supabase } from '@/lib/supabase-server';

export interface ConsistencyScore {
  averageScore: number;
  distribution: {
    high: number; // 70-100
    medium: number; // 40-69
    low: number; // 0-39
  };
  trend: string; // e.g., "+5.2%"
  studentScores: Array<{
    entityId: string;
    score: number;
    weeksActive: number;
    patternConsistency: number;
    decayRate: number;
  }>;
}

interface WeeklyActivity {
  week: string;
  hasActivity: boolean;
  dayOfWeek: number;
  hourOfDay: number;
}

/**
 * Calculate engagement consistency score for a client
 */
export async function calculateConsistencyScore(clientId: string): Promise<ConsistencyScore> {
  // Get last 8 weeks of activity events
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56); // 8 weeks

  const { data: events, error } = await supabase
    .from('events')
    .select('entity_id, created_at, event_type, event_data')
    .eq('client_id', clientId)
    .in('event_type', ['activity', 'engagement', 'course_enrollment'])
    .gte('created_at', eightWeeksAgo.toISOString())
    .order('created_at', { ascending: true });

  if (error || !events || events.length === 0) {
    return getEmptyConsistencyScore();
  }

  // Get all entities for this client
  const { data: entities } = await supabase
    .from('entities')
    .select('id')
    .eq('client_id', clientId);

  if (!entities || entities.length === 0) {
    return getEmptyConsistencyScore();
  }

  // Calculate score for each student
  const studentScores = entities.map(entity => {
    const studentEvents = events.filter(e => e.entity_id === entity.id);
    return calculateStudentConsistency(entity.id, studentEvents);
  }).filter(s => s.score > 0); // Only include students with activity

  if (studentScores.length === 0) {
    return getEmptyConsistencyScore();
  }

  // Calculate aggregate metrics
  const averageScore = studentScores.reduce((sum, s) => sum + s.score, 0) / studentScores.length;

  const distribution = {
    high: studentScores.filter(s => s.score >= 70).length,
    medium: studentScores.filter(s => s.score >= 40 && s.score < 70).length,
    low: studentScores.filter(s => s.score < 40).length,
  };

  // Calculate trend (compare recent 4 weeks vs previous 4 weeks)
  const trend = calculateTrend(studentScores);

  return {
    averageScore: Math.round(averageScore * 10) / 10,
    distribution,
    trend,
    studentScores: studentScores.slice(0, 100) // Limit for performance
  };
}

/**
 * Calculate consistency score for individual student
 */
function calculateStudentConsistency(entityId: string, events: any[]): {
  entityId: string;
  score: number;
  weeksActive: number;
  patternConsistency: number;
  decayRate: number;
} {
  if (events.length === 0) {
    return { entityId, score: 0, weeksActive: 0, patternConsistency: 0, decayRate: 0 };
  }

  // Group events by week
  const weeklyActivities = groupEventsByWeek(events);
  
  // Calculate weeks active (out of 8)
  const weeksActive = weeklyActivities.filter(w => w.hasActivity).length;
  const weeksActiveScore = (weeksActive / 8) * 0.4; // 40% weight

  // Calculate pattern consistency (same day/time patterns)
  const patternConsistency = calculatePatternConsistency(weeklyActivities);
  const patternScore = patternConsistency * 0.3; // 30% weight

  // Calculate decay rate (recent 4 weeks vs previous 4 weeks)
  const decayRate = calculateDecayRate(weeklyActivities);
  const decayScore = (1 - decayRate) * 0.3; // 30% weight

  const totalScore = (weeksActiveScore + patternScore + decayScore) * 100;

  return {
    entityId,
    score: Math.min(100, Math.max(0, Math.round(totalScore * 10) / 10)),
    weeksActive,
    patternConsistency: Math.round(patternConsistency * 100),
    decayRate: Math.round(decayRate * 100)
  };
}

/**
 * Group events by week
 */
function groupEventsByWeek(events: any[]): WeeklyActivity[] {
  const weeks: WeeklyActivity[] = [];
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekEvents = events.filter(e => {
      const eventDate = new Date(e.created_at);
      return eventDate >= weekStart && eventDate < weekEnd;
    });

    const hasActivity = weekEvents.length > 0;
    const avgDayOfWeek = hasActivity
      ? Math.round(weekEvents.reduce((sum, e) => sum + new Date(e.created_at).getDay(), 0) / weekEvents.length)
      : 0;
    const avgHourOfDay = hasActivity
      ? Math.round(weekEvents.reduce((sum, e) => sum + new Date(e.created_at).getHours(), 0) / weekEvents.length)
      : 0;

    weeks.push({
      week: `Week ${i + 1}`,
      hasActivity,
      dayOfWeek: avgDayOfWeek,
      hourOfDay: avgHourOfDay
    });
  }

  return weeks.reverse(); // Oldest to newest
}

/**
 * Calculate pattern consistency (same day/time engagement)
 */
function calculatePatternConsistency(weeks: WeeklyActivity[]): number {
  const activeWeeks = weeks.filter(w => w.hasActivity);
  
  if (activeWeeks.length < 2) {
    return 0;
  }

  // Check day of week consistency
  const days = activeWeeks.map(w => w.dayOfWeek);
  const uniqueDays = new Set(days);
  const dayConsistency = 1 - ((uniqueDays.size - 1) / 7); // More consistent = fewer unique days

  // Check hour of day consistency
  const hours = activeWeeks.map(w => w.hourOfDay);
  const hourVariance = Math.sqrt(
    hours.reduce((sum, h) => sum + Math.pow(h - (hours.reduce((a, b) => a + b, 0) / hours.length), 2), 0) / hours.length
  );
  const hourConsistency = Math.max(0, 1 - (hourVariance / 12)); // Lower variance = more consistent

  return (dayConsistency * 0.6 + hourConsistency * 0.4);
}

/**
 * Calculate engagement decay rate
 */
function calculateDecayRate(weeks: WeeklyActivity[]): number {
  const recentWeeks = weeks.slice(-4); // Last 4 weeks
  const previousWeeks = weeks.slice(0, 4); // First 4 weeks

  const recentActive = recentWeeks.filter(w => w.hasActivity).length;
  const previousActive = previousWeeks.filter(w => w.hasActivity).length;

  if (previousActive === 0) {
    return 0; // No baseline to compare
  }

  const decay = Math.max(0, (previousActive - recentActive) / previousActive);
  return Math.min(1, decay);
}

/**
 * Calculate trend comparing recent vs previous period
 */
function calculateTrend(studentScores: any[]): string {
  // No historical data to compare against yet
  // Return "N/A" instead of fake random numbers
  return 'N/A';
}

/**
 * Empty score when no data available
 */
function getEmptyConsistencyScore(): ConsistencyScore {
  return {
    averageScore: 0,
    distribution: { high: 0, medium: 0, low: 0 },
    trend: '0%',
    studentScores: []
  };
}

