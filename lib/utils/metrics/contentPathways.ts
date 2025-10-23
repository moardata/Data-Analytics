/**
 * Content Pathway Analysis
 * Identifies successful content sequences and dead-end experiences
 */

import { supabaseServer as supabase } from '@/lib/supabase-server';

export interface ContentPathways {
  topPathways: Array<{
    sequence: string[];
    completionRate: number;
    studentCount: number;
    avgTimeToComplete: string;
  }>;
  deadEnds: Array<{
    experienceId: string;
    experienceName: string;
    dropOffRate: number;
    studentCount: number;
  }>;
  powerCombinations: Array<{
    combination: string[];
    successRate: number;
    frequency: number;
  }>;
}

/**
 * Calculate content pathway analysis for a client
 */
export async function calculateContentPathways(clientId: string): Promise<ContentPathways> {
  // Get all experience_claimed events ordered by student and time
  const { data: events, error } = await supabase
    .from('events')
    .select('entity_id, created_at, event_data, event_type')
    .eq('client_id', clientId)
    .in('event_type', ['activity', 'engagement', 'subscription'])
    .order('entity_id', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !events || events.length === 0) {
    return getEmptyContentPathways();
  }

  // Build student journey sequences
  const studentJourneys = buildStudentJourneys(events);

  // Analyze pathways
  const pathwayAnalysis = analyzePathways(studentJourneys);

  // Find dead ends
  const deadEnds = findDeadEnds(studentJourneys);

  // Find power combinations
  const powerCombinations = findPowerCombinations(studentJourneys);

  return {
    topPathways: pathwayAnalysis.slice(0, 10), // Top 10 pathways
    deadEnds: deadEnds.slice(0, 10), // Top 10 dead ends
    powerCombinations: powerCombinations.slice(0, 5) // Top 5 combinations
  };
}

/**
 * Build student journey sequences from events
 */
function buildStudentJourneys(events: any[]): Map<string, any[]> {
  const journeys = new Map<string, any[]>();

  events.forEach(event => {
    const entityId = event.entity_id;
    const experienceId = event.event_data?.experience_id || event.event_data?.action || 'unknown';

    if (!journeys.has(entityId)) {
      journeys.set(entityId, []);
    }

    journeys.get(entityId)!.push({
      experienceId,
      timestamp: new Date(event.created_at),
      eventType: event.event_type
    });
  });

  // Sort each journey by timestamp
  journeys.forEach((journey, entityId) => {
    journey.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  });

  return journeys;
}

/**
 * Analyze successful pathways
 */
function analyzePathways(journeys: Map<string, any[]>): Array<{
  sequence: string[];
  completionRate: number;
  studentCount: number;
  avgTimeToComplete: string;
}> {
  const pathwayMap = new Map<string, {
    sequence: string[];
    completions: number;
    attempts: number;
    students: Set<string>;
    times: number[];
  }>();

  journeys.forEach((journey, entityId) => {
    if (journey.length < 2) return; // Need at least 2 experiences

    // Extract all possible sequences of length 2-5
    for (let length = 2; length <= Math.min(5, journey.length); length++) {
      for (let start = 0; start <= journey.length - length; start++) {
        const sequence = journey.slice(start, start + length).map(j => j.experienceId);
        const sequenceKey = sequence.join(' → ');

        if (!pathwayMap.has(sequenceKey)) {
          pathwayMap.set(sequenceKey, {
            sequence,
            completions: 0,
            attempts: 0,
            students: new Set(),
            times: []
          });
        }

        const pathway = pathwayMap.get(sequenceKey)!;
        pathway.attempts++;
        pathway.students.add(entityId);

        // Check if this sequence was completed (student continued after this sequence)
        const nextExperience = journey[start + length];
        if (nextExperience) {
          pathway.completions++;
          const timeToComplete = (nextExperience.timestamp.getTime() - journey[start].timestamp.getTime()) / (1000 * 60 * 60); // hours
          pathway.times.push(timeToComplete);
        }
      }
    }
  });

  // Convert to results
  const results: any[] = [];
  pathwayMap.forEach((data, sequenceKey) => {
    if (data.attempts < 3) return; // Need at least 3 attempts

    const completionRate = (data.completions / data.attempts) * 100;
    const avgTime = data.times.length > 0 
      ? data.times.reduce((a, b) => a + b, 0) / data.times.length 
      : 0;

    results.push({
      sequence: data.sequence,
      completionRate: Math.round(completionRate * 10) / 10,
      studentCount: data.students.size,
      avgTimeToComplete: formatTime(avgTime)
    });
  });

  return results.sort((a, b) => b.completionRate - a.completionRate);
}

/**
 * Find dead-end experiences (high drop-off rate)
 */
function findDeadEnds(journeys: Map<string, any[]>): Array<{
  experienceId: string;
  experienceName: string;
  dropOffRate: number;
  studentCount: number;
}> {
  const experienceStats = new Map<string, {
    totalStudents: Set<string>;
    continuedStudents: Set<string>;
  }>();

  journeys.forEach((journey, entityId) => {
    journey.forEach((step, index) => {
      const expId = step.experienceId;
      
      if (!experienceStats.has(expId)) {
        experienceStats.set(expId, {
          totalStudents: new Set(),
          continuedStudents: new Set()
        });
      }

      const stats = experienceStats.get(expId)!;
      stats.totalStudents.add(entityId);

      // Check if student continued after this experience
      const nextStep = journey[index + 1];
      if (nextStep) {
        stats.continuedStudents.add(entityId);
      }
    });
  });

  const results: any[] = [];
  experienceStats.forEach((stats, expId) => {
    if (stats.totalStudents.size < 3) return; // Need at least 3 students

    const dropOffRate = ((stats.totalStudents.size - stats.continuedStudents.size) / stats.totalStudents.size) * 100;
    
    if (dropOffRate > 50) { // Only include high drop-off experiences
      results.push({
        experienceId: expId,
        experienceName: formatExperienceName(expId),
        dropOffRate: Math.round(dropOffRate * 10) / 10,
        studentCount: stats.totalStudents.size
      });
    }
  });

  return results.sort((a, b) => b.dropOffRate - a.dropOffRate);
}

/**
 * Find power combinations (high success rate combinations)
 */
function findPowerCombinations(journeys: Map<string, any[]>): Array<{
  combination: string[];
  successRate: number;
  frequency: number;
}> {
  const combinationMap = new Map<string, {
    attempts: number;
    successes: number;
  }>();

  journeys.forEach((journey, entityId) => {
    if (journey.length < 3) return;

    // Look for 3-experience combinations
    for (let i = 0; i <= journey.length - 3; i++) {
      const combination = journey.slice(i, i + 3).map(j => j.experienceId);
      const combinationKey = combination.join(' → ');

      if (!combinationMap.has(combinationKey)) {
        combinationMap.set(combinationKey, { attempts: 0, successes: 0 });
      }

      const stats = combinationMap.get(combinationKey)!;
      stats.attempts++;

      // Check if student continued after this combination
      const nextStep = journey[i + 3];
      if (nextStep) {
        stats.successes++;
      }
    }
  });

  const results: any[] = [];
  combinationMap.forEach((stats, combinationKey) => {
    if (stats.attempts < 5) return; // Need at least 5 attempts

    const successRate = (stats.successes / stats.attempts) * 100;
    
    if (successRate > 80) { // Only high-success combinations
      results.push({
        combination: combinationKey.split(' → '),
        successRate: Math.round(successRate * 10) / 10,
        frequency: stats.attempts
      });
    }
  });

  return results.sort((a, b) => b.successRate - a.successRate);
}

/**
 * Format time duration
 */
function formatTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  } else if (hours < 24) {
    return `${Math.round(hours * 10) / 10}h`;
  } else {
    return `${Math.round((hours / 24) * 10) / 10}d`;
  }
}

/**
 * Format experience name
 */
function formatExperienceName(expId: string): string {
  return expId
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Empty content pathways data
 */
function getEmptyContentPathways(): ContentPathways {
  return {
    topPathways: [],
    deadEnds: [],
    powerCombinations: []
  };
}
