/**
 * Commitment Probability Score
 * Rule-based scoring system for student completion likelihood
 */

import { supabaseServer as supabase } from '@/lib/supabase-server';

export interface CommitmentScore {
  averageScore: number;
  distribution: {
    high: number; // 70-100
    medium: number; // 40-69
    atRisk: number; // 0-39
  };
  atRiskStudents: Array<{
    entityId: string;
    name: string;
    score: number;
    riskFactors: string[];
  }>;
  totalStudents: number;
}

/**
 * Calculate commitment scores for a client
 */
export async function calculateCommitmentScore(clientId: string): Promise<CommitmentScore> {
  // Get all entities for this client
  const { data: entities, error: entitiesError } = await supabase
    .from('entities')
    .select('id, name, created_at')
    .eq('client_id', clientId);

  if (entitiesError || !entities || entities.length === 0) {
    return getEmptyCommitmentScore();
  }

  // Get events for each entity from their first 7 days
  const studentScores = await Promise.all(
    entities.map(async (entity) => {
      const score = await calculateStudentCommitment(entity);
      return score;
    })
  );

  // Filter out students with no activity
  const activeStudents = studentScores.filter(s => s.score > 0);

  if (activeStudents.length === 0) {
    return getEmptyCommitmentScore();
  }

  // Calculate aggregate metrics
  const averageScore = activeStudents.reduce((sum, s) => sum + s.score, 0) / activeStudents.length;

  const distribution = {
    high: activeStudents.filter(s => s.score >= 70).length,
    medium: activeStudents.filter(s => s.score >= 40 && s.score < 70).length,
    atRisk: activeStudents.filter(s => s.score < 40).length,
  };

  // Get at-risk students
  const atRiskStudents = activeStudents
    .filter(s => s.score < 40)
    .sort((a, b) => a.score - b.score)
    .slice(0, 20); // Top 20 at-risk

  return {
    averageScore: Math.round(averageScore * 10) / 10,
    distribution,
    atRiskStudents,
    totalStudents: activeStudents.length
  };
}

/**
 * Calculate commitment score for individual student
 */
async function calculateStudentCommitment(entity: any): Promise<{
  entityId: string;
  name: string;
  score: number;
  riskFactors: string[];
}> {
  const entityId = entity.id;
  const createdAt = new Date(entity.created_at);
  
  // Get first 7 days of events
  const sevenDaysLater = new Date(createdAt);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const { data: events, error } = await supabase
    .from('events')
    .select('created_at, event_type, event_data')
    .eq('entity_id', entityId)
    .in('event_type', ['activity', 'engagement', 'course_enrollment', 'subscription'])
    .gte('created_at', createdAt.toISOString())
    .lte('created_at', sevenDaysLater.toISOString())
    .order('created_at', { ascending: true });

  if (error || !events || events.length === 0) {
    return {
      entityId,
      name: entity.name || `Student ${entityId.slice(0, 8)}`,
      score: 0,
      riskFactors: ['No activity in first 7 days']
    };
  }

  // Calculate score components
  const timeToFirstScore = calculateTimeToFirstScore(events, createdAt);
  const engagementFrequencyScore = calculateEngagementFrequencyScore(events);
  const explorationScore = calculateExplorationScore(events);

  // Calculate total score
  const totalScore = timeToFirstScore + engagementFrequencyScore + explorationScore;
  const finalScore = Math.min(100, Math.max(0, Math.round(totalScore * 10) / 10));

  // Identify risk factors
  const riskFactors = identifyRiskFactors(events, timeToFirstScore, engagementFrequencyScore, explorationScore);

  return {
    entityId,
    name: entity.name || `Student ${entityId.slice(0, 8)}`,
    score: finalScore,
    riskFactors
  };
}

/**
 * Calculate time to first experience score (40% weight)
 */
function calculateTimeToFirstScore(events: any[], createdAt: Date): number {
  if (events.length === 0) return 0;

  const firstEvent = new Date(events[0].created_at);
  const hoursToFirst = (firstEvent.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (hoursToFirst < 6) return 40;
  if (hoursToFirst < 24) return 30;
  if (hoursToFirst < 48) return 20;
  return 10;
}

/**
 * Calculate engagement frequency score (35% weight)
 */
function calculateEngagementFrequencyScore(events: any[]): number {
  if (events.length === 0) return 0;

  // Group events by day
  const daysWithActivity = new Set<string>();
  events.forEach(event => {
    const eventDate = new Date(event.created_at);
    const dayKey = eventDate.toISOString().split('T')[0];
    daysWithActivity.add(dayKey);
  });

  const daysActive = daysWithActivity.size;
  
  if (daysActive >= 7) return 35; // Daily engagement
  if (daysActive >= 5) return 25; // 5-6 days
  if (daysActive >= 3) return 15; // 3-4 days
  if (daysActive >= 1) return 5;  // 1-2 days
  return 0;
}

/**
 * Calculate multi-experience exploration score (25% weight)
 */
function calculateExplorationScore(events: any[]): number {
  if (events.length === 0) return 0;

  // Count unique experiences
  const uniqueExperiences = new Set<string>();
  events.forEach(event => {
    const expId = event.event_data?.experience_id || event.event_data?.action || 'unknown';
    if (expId !== 'unknown') {
      uniqueExperiences.add(expId);
    }
  });

  const experienceCount = uniqueExperiences.size;
  
  if (experienceCount >= 5) return 25; // 5+ experiences
  if (experienceCount >= 3) return 18; // 3-4 experiences
  if (experienceCount >= 2) return 10; // 2 experiences
  if (experienceCount >= 1) return 5;  // 1 experience
  return 0;
}

/**
 * Identify risk factors for at-risk students
 */
function identifyRiskFactors(
  events: any[],
  timeScore: number,
  frequencyScore: number,
  explorationScore: number
): string[] {
  const riskFactors: string[] = [];

  if (timeScore < 20) {
    riskFactors.push('Slow to start (took >24 hours)');
  }

  if (frequencyScore < 15) {
    riskFactors.push('Low engagement frequency');
  }

  if (explorationScore < 10) {
    riskFactors.push('Limited content exploration');
  }

  if (events.length < 3) {
    riskFactors.push('Very few activities');
  }

  // Check for long gaps between activities
  if (events.length > 1) {
    const sortedEvents = events.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    for (let i = 1; i < sortedEvents.length; i++) {
      const prevTime = new Date(sortedEvents[i - 1].created_at);
      const currTime = new Date(sortedEvents[i].created_at);
      const hoursBetween = (currTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60);

      if (hoursBetween > 48) {
        riskFactors.push('Long gaps between activities');
        break;
      }
    }
  }

  return riskFactors.length > 0 ? riskFactors : ['Low overall engagement'];
}

/**
 * Empty commitment score data
 */
function getEmptyCommitmentScore(): CommitmentScore {
  return {
    averageScore: 0,
    distribution: { high: 0, medium: 0, atRisk: 0 },
    atRiskStudents: [],
    totalStudents: 0
  };
}
