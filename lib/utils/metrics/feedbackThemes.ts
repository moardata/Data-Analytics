/**
 * Top Feedback Themes
 * Aggregates recurring themes from form submissions and AI insights
 */

import { supabaseServer as supabase } from '@/lib/supabase-server';

export interface FeedbackThemes {
  hasData: boolean;
  themes: Array<{
    title: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    sharePct: number;
    urgency: 'low' | 'medium' | 'high';
    suggestedAction: string;
  }>;
  totalSubmissions: number;
  lastUpdated: string;
  ctaMessage?: string; // Show if insufficient data
}

/**
 * Calculate feedback themes for a client
 */
export async function calculateFeedbackThemes(clientId: string): Promise<FeedbackThemes> {
  // Get form submissions from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: submissions, error: subError } = await supabase
    .from('form_submissions')
    .select('id, responses, submitted_at')
    .eq('client_id', clientId)
    .gte('submitted_at', sevenDaysAgo.toISOString())
    .order('submitted_at', { ascending: false });

  if (subError) {
    console.error('Error fetching form submissions:', subError);
    return getEmptyFeedbackThemes();
  }

  // Check if we have enough data
  if (!submissions || submissions.length < 5) {
    return {
      hasData: false,
      themes: [],
      totalSubmissions: submissions?.length || 0,
      lastUpdated: new Date().toISOString(),
      ctaMessage: 'Create surveys to start collecting feedback themes'
    };
  }

  // Get AI insights for this client from last 7 days
  const { data: insights, error: insightsError } = await supabase
    .from('insights')
    .select('title, content, metadata, created_at')
    .eq('client_id', clientId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  if (insightsError) {
    console.error('Error fetching insights:', insightsError);
    return getEmptyFeedbackThemes();
  }

  // Process themes from insights
  const themes = processInsightsToThemes(insights || []);

  return {
    hasData: true,
    themes: themes.slice(0, 5), // Top 5 themes
    totalSubmissions: submissions.length,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Process AI insights into theme format
 */
function processInsightsToThemes(insights: any[]): Array<{
  title: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sharePct: number;
  urgency: 'low' | 'medium' | 'high';
  suggestedAction: string;
}> {
  return insights.map(insight => {
    const metadata = insight.metadata || {};
    
    return {
      title: insight.title || 'Untitled Theme',
      sentiment: metadata.sentiment || 'neutral',
      sharePct: metadata.share_pct || 0,
      urgency: metadata.urgency || 'low',
      suggestedAction: insight.content || 'No action suggested'
    };
  }).filter(theme => theme.title !== 'Untitled Theme');
}

/**
 * Empty feedback themes data
 */
function getEmptyFeedbackThemes(): FeedbackThemes {
  return {
    hasData: false,
    themes: [],
    totalSubmissions: 0,
    lastUpdated: new Date().toISOString(),
    ctaMessage: 'No feedback data available'
  };
}
