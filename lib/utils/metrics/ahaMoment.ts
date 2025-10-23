/**
 * Aha Moment Score
 * Detects engagement spikes after specific content/experiences
 */

import { supabaseServer as supabase } from '@/lib/supabase-server';

export interface AhaMomentScore {
  topExperiences: Array<{
    experienceId: string;
    experienceName: string;
    spikePercent: number;
    studentCount: number;
  }>;
  avgTimeToFirstBreakthrough: string;
  stagnantStudents: number;
  stagnantStudentsList: Array<{
    entityId: string;
    daysSinceLastActivity: number;
  }>;
}

/**
 * Calculate aha moment scores for a client
 */
export async function calculateAhaMomentScore(clientId: string): Promise<AhaMomentScore> {
  // Get all experience_claimed events
  const { data: experienceEvents, error: expError } = await supabase
    .from('events')
    .select('entity_id, created_at, event_data, event_type')
    .eq('client_id', clientId)
    .in('event_type', ['activity', 'engagement', 'subscription'])
    .order('created_at', { ascending: true });

  if (expError || !experienceEvents || experienceEvents.length === 0) {
    return getEmptyAhaMoment();
  }

  // Get all entities
  const { data: entities } = await supabase
    .from('entities')
    .select('id, created_at')
    .eq('client_id', clientId);

  if (!entities || entities.length === 0) {
    return getEmptyAhaMoment();
  }

  // Analyze engagement spikes per experience
  const experienceAnalysis = analyzeExperienceSpikes(experienceEvents);

  // Calculate time to first breakthrough
  const avgTimeToBreakthrough = calculateTimeToFirstBreakthrough(entities, experienceEvents);

  // Detect stagnant students
  const stagnantStudents = detectStagnantStudents(entities, experienceEvents);

  return {
    topExperiences: experienceAnalysis.slice(0, 5), // Top 5
    avgTimeToFirstBreakthrough,
    stagnantStudents: stagnantStudents.length,
    stagnantStudentsList: stagnantStudents.slice(0, 20) // Top 20 at-risk
  };
}

/**
 * Analyze engagement spikes for each experience
 */
function analyzeExperienceSpikes(events: any[]): Array<{
  experienceId: string;
  experienceName: string;
  spikePercent: number;
  studentCount: number;
}> {
  // Group by experience_id
  const experienceMap = new Map<string, any[]>();
  
  events.forEach(event => {
    const expId = event.event_data?.experience_id || event.event_data?.action || 'unknown';
    if (!experienceMap.has(expId)) {
      experienceMap.set(expId, []);
    }
    experienceMap.get(expId)!.push(event);
  });

  const results: any[] = [];

  experienceMap.forEach((expEvents, expId) => {
    if (expId === 'unknown' || expEvents.length < 5) return;

    // Group by entity
    const entityMap = new Map<string, any[]>();
    expEvents.forEach(e => {
      if (!entityMap.has(e.entity_id)) {
        entityMap.set(e.entity_id, []);
      }
      entityMap.get(e.entity_id)!.push(e);
    });

    // Calculate engagement spike
    let totalSpike = 0;
    let studentCount = 0;

    entityMap.forEach((studentEvents, entityId) => {
      const spike = calculateEngagementSpike(studentEvents, events.filter(e => e.entity_id === entityId));
      if (spike > 0) {
        totalSpike += spike;
        studentCount++;
      }
    });

    if (studentCount > 0) {
      const avgSpike = totalSpike / studentCount;
      results.push({
        experienceId: expId,
        experienceName: formatExperienceName(expId),
        spikePercent: Math.round(avgSpike * 100) / 100,
        studentCount
      });
    }
  });

  return results.sort((a, b) => b.spikePercent - a.spikePercent);
}

/**
 * Calculate engagement spike for a student after an experience
 */
function calculateEngagementSpike(experienceEvents: any[], allStudentEvents: any[]): number {
  if (experienceEvents.length === 0) return 0;

  const firstExpDate = new Date(experienceEvents[0].created_at);
  
  // Get activity 7 days before
  const sevenDaysBefore = new Date(firstExpDate);
  sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
  
  const beforeEvents = allStudentEvents.filter(e => {
    const d = new Date(e.created_at);
    return d >= sevenDaysBefore && d < firstExpDate;
  });

  // Get activity 7 days after
  const sevenDaysAfter = new Date(firstExpDate);
  sevenDaysAfter.setDate(sevenDaysAfter.getDate() + 7);
  
  const afterEvents = allStudentEvents.filter(e => {
    const d = new Date(e.created_at);
    return d >= firstExpDate && d < sevenDaysAfter;
  });

  const beforeCount = beforeEvents.length || 1; // Avoid division by zero
  const afterCount = afterEvents.length;

  const spike = ((afterCount - beforeCount) / beforeCount) * 100;
  return Math.max(0, spike); // Only positive spikes
}

/**
 * Calculate average time to first breakthrough (first major engagement)
 */
function calculateTimeToFirstBreakthrough(entities: any[], events: any[]): string {
  const breakthroughTimes: number[] = [];

  entities.forEach(entity => {
    const entityEvents = events.filter(e => e.entity_id === entity.id);
    if (entityEvents.length === 0) return;

    const createdAt = new Date(entity.created_at);
    const firstEvent = new Date(entityEvents[0].created_at);
    
    const hoursToFirst = (firstEvent.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    breakthroughTimes.push(hoursToFirst);
  });

  if (breakthroughTimes.length === 0) {
    return 'N/A';
  }

  const avgHours = breakthroughTimes.reduce((a, b) => a + b, 0) / breakthroughTimes.length;
  
  if (avgHours < 1) {
    return `${Math.round(avgHours * 60)} minutes`;
  } else if (avgHours < 24) {
    return `${Math.round(avgHours * 10) / 10} hours`;
  } else {
    return `${Math.round((avgHours / 24) * 10) / 10} days`;
  }
}

/**
 * Detect stagnant students (>14 days with low engagement)
 */
function detectStagnantStudents(entities: any[], events: any[]): Array<{
  entityId: string;
  daysSinceLastActivity: number;
}> {
  const stagnant: any[] = [];
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  entities.forEach(entity => {
    const entityEvents = events.filter(e => e.entity_id === entity.id);
    
    if (entityEvents.length === 0) return;

    // Get most recent event
    const sortedEvents = entityEvents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastEvent = new Date(sortedEvents[0].created_at);

    // Check if stagnant (>14 days since last activity)
    if (lastEvent < fourteenDaysAgo) {
      const daysSince = Math.floor((now.getTime() - lastEvent.getTime()) / (1000 * 60 * 60 * 24));
      stagnant.push({
        entityId: entity.id,
        daysSinceLastActivity: daysSince
      });
    }
  });

  return stagnant.sort((a, b) => b.daysSinceLastActivity - a.daysSinceLastActivity);
}

/**
 * Format experience name for display
 */
function formatExperienceName(expId: string): string {
  // Convert experience_id to readable name
  return expId
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Empty aha moment data
 */
function getEmptyAhaMoment(): AhaMomentScore {
  return {
    topExperiences: [],
    avgTimeToFirstBreakthrough: 'N/A',
    stagnantStudents: 0,
    stagnantStudentsList: []
  };
}

