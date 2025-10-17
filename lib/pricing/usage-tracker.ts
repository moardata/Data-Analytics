/**
 * Usage Tracker for Pricing Tiers
 * Tracks daily usage and enforces limits
 */

import { supabaseServer as supabase } from '@/lib/supabase-server';
import { getTier, type TierName } from './tiers';

export interface UsageStats {
  studentCount: number;
  formCount: number;
  aiInsightsToday: number;
  lastResetDate: string;
}

/**
 * Get current usage for a client
 */
export async function getClientUsage(companyId: string): Promise<UsageStats> {
  const today = new Date().toISOString().split('T')[0];

  // First, get the client record for this company
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('company_id', companyId)
    .single();

  if (clientError || !clientData) {
    console.error('Client not found for company:', companyId);
    return {
      studentCount: 0,
      formCount: 0,
      aiInsightsToday: 0,
      lastResetDate: today,
    };
  }

  const clientId = clientData.id; // This is the actual UUID

  // Get student count
  const { count: studentCount } = await supabase
    .from('entities')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId);

  // Get form count
  const { count: formCount } = await supabase
    .from('form_templates')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId);

  // Get AI insights generated today (if ai_runs table exists)
  let aiInsightsToday = 0;
  try {
    const { count } = await supabase
      .from('ai_runs')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);
    aiInsightsToday = count || 0;
  } catch (error) {
    console.log('ai_runs table not available, using insights table instead');
    // Fallback to insights table
    const { count } = await supabase
      .from('insights')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);
    aiInsightsToday = count || 0;
  }

  return {
    studentCount: studentCount || 0,
    formCount: formCount || 0,
    aiInsightsToday: aiInsightsToday || 0,
    lastResetDate: today,
  };
}

/**
 * Check if client can perform action based on their tier limits
 */
export async function checkLimit(
  companyId: string,
  tier: TierName,
  action: 'addStudent' | 'createForm' | 'generateInsight'
): Promise<{ allowed: boolean; reason?: string; current?: number; limit?: number }> {
  const tierData = getTier(tier);
  const usage = await getClientUsage(companyId);

  switch (action) {
    case 'addStudent':
      const studentLimit = tierData.limits.maxStudents;
      if (usage.studentCount >= studentLimit) {
        return {
          allowed: false,
          reason: `Student limit reached. Upgrade to add more students.`,
          current: usage.studentCount,
          limit: studentLimit,
        };
      }
      return { allowed: true };

    case 'createForm':
      const formLimit = tierData.limits.maxForms;
      if (usage.formCount >= formLimit) {
        return {
          allowed: false,
          reason: `Form limit reached. Upgrade to create more forms.`,
          current: usage.formCount,
          limit: formLimit,
        };
      }
      return { allowed: true };

    case 'generateInsight':
      const insightLimit = tierData.limits.aiInsightsPerDay;
      if (usage.aiInsightsToday >= insightLimit) {
        return {
          allowed: false,
          reason: `Daily AI insight limit reached (${insightLimit}). Try again tomorrow or upgrade for more insights.`,
          current: usage.aiInsightsToday,
          limit: insightLimit,
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

/**
 * Track an action (increment usage)
 */
export async function trackAction(
  companyId: string,
  action: 'generateInsight'
): Promise<void> {
  if (action === 'generateInsight') {
    // First, get the client record for this company
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      console.error('Client not found for company:', companyId);
      return;
    }

    const clientId = clientData.id; // This is the actual UUID

    // Create an AI run record (if ai_runs table exists)
    try {
      await supabase.from('ai_runs').insert({
        client_id: clientId,
        run_type: 'insight_generation',
        status: 'completed',
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
      });
    } catch (error) {
      console.log('ai_runs table not available, skipping run tracking');
    }
  }
}

/**
 * Clean up old insights based on tier history limits
 */
export async function cleanupOldInsights(companyId: string, tier: TierName): Promise<number> {
  // First, get the client record for this company
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('company_id', companyId)
    .single();

  if (clientError || !clientData) {
    console.error('Client not found for company:', companyId);
    return 0;
  }

  const clientId = clientData.id; // This is the actual UUID

  const tierData = getTier(tier);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - tierData.limits.aiInsightsHistory);

  const { data: oldInsights, error } = await supabase
    .from('insights')
    .delete()
    .eq('client_id', clientId)
    .lt('created_at', cutoffDate.toISOString())
    .select();

  if (error) {
    console.error('Error cleaning up old insights:', error);
    return 0;
  }

  return oldInsights?.length || 0;
}

/**
 * Get usage percentage for display
 */
export function getUsagePercentage(current: number, limit: number): number {
  if (limit === 0) return 100;
  return Math.min(Math.round((current / limit) * 100), 100);
}



