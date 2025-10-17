/**
 * AI Insights Generation
 * Uses OpenAI to analyze feedback and generate actionable insights
 */

import OpenAI from 'openai';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { scrubText } from './piiScrubber';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface InsightTheme {
  title: string;
  share_pct: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  suggested_action: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface AIAnalysisResult {
  themes: InsightTheme[];
  summary: string;
  key_takeaways: string[];
}

/**
 * Generate insights for a client based on their text data
 */
export async function generateInsightsForClient(
  clientId: string,
  range: string = 'week'
): Promise<any[]> {
  // Create AI run record (if ai_runs table exists)
  let aiRunId: string | null = null;
  try {
    const { data: aiRun } = await supabase
      .from('ai_runs')
      .insert({
        client_id: clientId,
        run_type: 'insight_generation',
        status: 'running',
        meta: { range }
      })
      .select()
      .single();
    aiRunId = aiRun?.id || null;
  } catch (error) {
    console.log('ai_runs table not available, skipping run tracking');
  }

  try {
    // Get text data from form submissions directly
    const daysAgo = range === 'week' ? 7 : range === 'month' ? 30 : 90;
    const startDate = new Date(Date.now() - daysAgo * 86400000).toISOString();

    const { data: formSubmissions } = await supabase
      .from('form_submissions')
      .select('responses, submitted_at')
      .eq('client_id', clientId)
      .gte('submitted_at', startDate)
      .order('submitted_at', { ascending: false })
      .limit(100);

    if (!formSubmissions || formSubmissions.length === 0) {
      // No data - mark as completed and return stub insights
      if (aiRunId) {
        await supabase
          .from('ai_runs')
          .update({ status: 'completed', finished_at: new Date().toISOString() })
          .eq('id', aiRunId);
      }

      return getStubInsights(clientId);
    }

    // Extract text from form responses
    const textPool = formSubmissions.flatMap(submission => {
      const texts: any[] = [];
      Object.values(submission.responses || {}).forEach(value => {
        if (typeof value === 'string' && value.length > 10) {
          texts.push({
            id: Math.random().toString(),
            text: value,
            source: 'form_submission',
            created_at: submission.submitted_at
          });
        }
      });
      return texts;
    });

    // Scrub PII from texts
    const scrubbedTexts = textPool.map(item => ({
      ...item,
      text: scrubText(item.text)
    }));

    // Generate insights using AI or stub
    let result: AIAnalysisResult;
    
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        result = await generateWithOpenAI(scrubbedTexts);
      } catch (error: any) {
        console.warn('OpenAI failed, falling back to stub insights:', error.message);
        result = generateStubAnalysis(scrubbedTexts);
      }
    } else {
      result = generateStubAnalysis(scrubbedTexts);
    }

    // Store insights in database
    const insights = await storeInsights(clientId, result);

    // Mark run as completed (if ai_runs table exists)
    if (aiRunId) {
      await supabase
        .from('ai_runs')
        .update({ 
          status: 'completed', 
          finished_at: new Date().toISOString(),
          meta: { range, insights_count: insights.length }
        })
        .eq('id', aiRunId);
    }

    return insights;

  } catch (error: any) {
    // Mark run as failed (if ai_runs table exists)
    if (aiRunId) {
      await supabase
        .from('ai_runs')
        .update({ 
          status: 'failed', 
          finished_at: new Date().toISOString(),
          error: error.message 
        })
        .eq('id', aiRunId);
    }

    throw error;
  }
}

/**
 * Generate insights using OpenAI Responses API with gpt-5-nano
 */
async function generateWithOpenAI(texts: any[]): Promise<AIAnalysisResult> {
  const textSample = texts.slice(0, 30).map(t => t.text).join('\n---\n');

  const prompt = `You are analyzing ${texts.length} student feedback responses for a real estate course creator. Identify the TOP 3-4 MOST ACTIONABLE themes.

For EACH theme, provide:
- title: Specific, descriptive name (not generic)
- share_pct: Realistic percentage of responses mentioning this (0-100)
- sentiment: positive, negative, or neutral
- suggested_action: SPECIFIC, detailed action the creator should take (include examples or numbers)
- urgency: low, medium, or high

BE SPECIFIC. Use actual details from the feedback. Don't be generic.

Example of GOOD insight:
{
  "title": "Video buffering on mobile (Module 5)",
  "share_pct": 15,
  "sentiment": "negative",
  "suggested_action": "Fix video hosting for Module 5 - students report crashes on mobile. Consider switching to adaptive bitrate streaming or compressing video files.",
  "urgency": "high"
}

Example of BAD (generic) insight:
{
  "title": "Content quality",
  "share_pct": 50,
  "sentiment": "positive",
  "suggested_action": "Keep making good content",
  "urgency": "low"
}

Feedback:
${textSample}

Return JSON with 3-4 themes, a summary, and key takeaways:
{
  "themes": [{ "title": "...", "share_pct": 50, "sentiment": "positive", "suggested_action": "...", "urgency": "medium" }],
  "summary": "2-3 sentence overview with specifics",
  "key_takeaways": ["Specific takeaway 1", "Specific takeaway 2", "Specific takeaway 3"]
}`;

  try {
    // Use standard Chat Completions API with gpt-4o-mini (cheap and fast)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at analyzing student feedback for online course creators. Be specific and actionable. Avoid generic advice. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const result = JSON.parse(resultText);
    return result as AIAnalysisResult;
  } catch (error) {
    console.error('Failed to use OpenAI:', error);
    throw error;
  }
}

/**
 * Generate stub analysis when OpenAI is not available
 */
function generateStubAnalysis(texts: any[]): AIAnalysisResult {
  // Generate insights based on actual data patterns
  const totalTexts = texts.length;
  const hasData = totalTexts > 0;
  
  if (!hasData) {
    return {
      themes: [
        {
          title: 'No data available',
          share_pct: 100,
          sentiment: 'neutral',
          suggested_action: 'Start collecting student feedback and engagement data to generate meaningful insights.',
          urgency: 'low'
        }
      ],
      summary: 'No student feedback data available yet. Start collecting responses to generate AI insights.',
      key_takeaways: [
        'Begin collecting student feedback through forms and surveys',
        'Track student engagement and progress metrics',
        'Set up regular data collection processes'
      ]
    };
  }

  // Generate insights based on actual data volume
  const engagementLevel = totalTexts < 5 ? 'low' : totalTexts < 20 ? 'medium' : 'high';
  
  return {
    themes: [
      {
        title: 'Data collection progress',
        share_pct: 60,
        sentiment: 'positive',
        suggested_action: `You have ${totalTexts} data points. Continue collecting feedback to improve insight quality.`,
        urgency: 'low'
      },
      {
        title: 'Engagement analysis needed',
        share_pct: 40,
        sentiment: 'neutral',
        suggested_action: `Your engagement level is ${engagementLevel}. Consider implementing more feedback collection methods.`,
        urgency: 'medium'
      }
    ],
    summary: `Based on ${totalTexts} data points, your engagement level is ${engagementLevel}. Continue collecting data for better insights.`,
    key_takeaways: [
      `You have ${totalTexts} data points collected`,
      `Engagement level: ${engagementLevel}`,
      'Continue collecting feedback for more detailed insights'
    ]
  };
}

/**
 * Store insights in database
 */
async function storeInsights(clientId: string, result: AIAnalysisResult): Promise<any[]> {
  const insights = result.themes.map((theme) => ({
    client_id: clientId,
    title: theme.title,
    content: theme.suggested_action, // Full detailed action
    insight_type: theme.urgency === 'high' ? 'alert' : theme.sentiment === 'positive' ? 'recommendation' : 'trend',
    metadata: {
      share_pct: theme.share_pct,
      sentiment: theme.sentiment,
      suggested_action: theme.suggested_action,
      urgency: theme.urgency,
      ai_generated: true,
      model: 'gpt-4o-mini'
    }
  }));

  const { data, error } = await supabase
    .from('insights')
    .insert(insights)
    .select();

  if (error) throw error;
  return data || [];
}

/**
 * Get stub insights when no data available
 */
function getStubInsights(clientId: string): any[] {
  return [
    {
      client_id: clientId,
      title: 'No data yet',
      content: 'Collect more student responses to generate insights',
      insight_type: 'weekly_summary',
      metadata: {},
      created_at: new Date().toISOString()
    }
  ];
}

/**
 * Detect anomalies in metrics
 */
export async function detectAnomalies(clientId: string): Promise<any[]> {
  // Get recent metrics
  const { data: recentEvents } = await supabase
    .from('events')
    .select('event_type, created_at, event_data')
    .eq('client_id', clientId)
    .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
    .order('created_at', { ascending: true });

  if (!recentEvents || recentEvents.length < 10) return [];

  const anomalies: any[] = [];

  // Check for revenue drops
  const recentRevenue = recentEvents
    .filter(e => e.event_type === 'order')
    .slice(-7)
    .reduce((sum, e) => sum + (e.event_data?.amount || 0), 0);

  const previousRevenue = recentEvents
    .filter(e => e.event_type === 'order')
    .slice(-14, -7)
    .reduce((sum, e) => sum + (e.event_data?.amount || 0), 0);

  if (previousRevenue > 0 && recentRevenue < previousRevenue * 0.7) {
    anomalies.push({
      client_id: clientId,
      title: 'Revenue Drop Detected',
      content: `Revenue is down ${Math.round(((previousRevenue - recentRevenue) / previousRevenue) * 100)}% this week`,
      insight_type: 'alert',
      metadata: { anomaly_type: 'revenue_drop', previous: previousRevenue, current: recentRevenue }
    });
  }

  // Check for engagement drops
  const recentActivity = recentEvents.filter(e => e.event_type === 'activity').slice(-7).length;
  const previousActivity = recentEvents.filter(e => e.event_type === 'activity').slice(-14, -7).length;

  if (previousActivity > 0 && recentActivity < previousActivity * 0.6) {
    anomalies.push({
      client_id: clientId,
      title: 'Engagement Drop',
      content: 'Student activity has decreased significantly this week',
      insight_type: 'alert',
      metadata: { anomaly_type: 'engagement_drop', previous: previousActivity, current: recentActivity }
    });
  }

  // Store anomalies
  if (anomalies.length > 0) {
    await supabase.from('insights').insert(anomalies);
  }

  return anomalies;
}
