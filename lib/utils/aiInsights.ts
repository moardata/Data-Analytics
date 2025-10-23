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
    // Get comprehensive data using the enhanced data collection API
    const daysAgo = range === 'week' ? 7 : range === 'month' ? 30 : 90;
    const startDate = new Date(Date.now() - daysAgo * 86400000).toISOString();

    // Get ALL available data sources - form submissions, events, subscriptions
    console.log('📊 Fetching all data sources for AI analysis...');
    
    // 1. Form submissions (feedback, surveys)
    const { data: formSubmissions, error: formError } = await supabase
      .from('form_submissions')
      .select('responses, submitted_at, form_id')
      .eq('client_id', clientId)
      .gte('submitted_at', startDate)
      .order('submitted_at', { ascending: false })
      .limit(100);
    
    if (formError) {
      console.error('Form submissions query error:', formError);
    }

    // 2. Get ALL events for comprehensive analysis
    const { data: allEvents } = await supabase
      .from('events')
      .select('event_type, event_data, created_at, metadata')
      .eq('client_id', clientId)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .limit(500);

    // 3. Get subscription data for churn/revenue insights
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('status, created_at, cancelled_at, metadata, plan_id')
      .eq('client_id', clientId)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    // 4. Get entity (student) data for engagement patterns
    const { data: entities } = await supabase
      .from('entities')
      .select('metadata, created_at')
      .eq('client_id', clientId)
      .gte('created_at', startDate);

    console.log('📊 Data fetched:', {
      formSubmissions: formSubmissions?.length || 0,
      events: allEvents?.length || 0,
      subscriptions: subscriptions?.length || 0,
      entities: entities?.length || 0,
      startDate,
      clientId
    });

    // Check if we have ANY data at all
    const hasAnyData = (formSubmissions && formSubmissions.length > 0) ||
                       (allEvents && allEvents.length > 0) ||
                       (subscriptions && subscriptions.length > 0);

    if (!hasAnyData) {
      console.error('❌ No data available in any table');
      console.error('Debug info:', {
        formSubmissionsNull: formSubmissions === null,
        eventsNull: allEvents === null,
        subsNull: subscriptions === null,
        startDate,
        clientId
      });
      throw new Error('No data available for analysis. Database appears empty. Run the mock data generator script.');
    }

    // Build comprehensive text data from ALL sources
    const textPool: any[] = [];

    // Extract from form submissions
    if (formSubmissions && formSubmissions.length > 0) {
      formSubmissions.forEach(submission => {
        Object.values(submission.responses || {}).forEach(value => {
          if (typeof value === 'string' && value.length > 10) {
            textPool.push({
              text: value,
              source: 'survey_response',
              date: submission.submitted_at
            });
          }
        });
      });
    }

    // Extract insights from events
    if (allEvents && allEvents.length > 0) {
      // Group events by type for analysis
      const eventsByType: Record<string, number> = {};
      allEvents.forEach(event => {
        eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
      });

      // Add event summaries as text for AI
      Object.entries(eventsByType).forEach(([type, count]) => {
        textPool.push({
          text: `Event Pattern: ${type} occurred ${count} times in the last ${range}`,
          source: 'event_analytics',
          date: new Date().toISOString()
        });
      });

      // Add specific notable events
      const payments = allEvents.filter(e => e.event_type === 'payment.succeeded');
      const refunds = allEvents.filter(e => e.event_type === 'payment.refunded');
      const cancellations = allEvents.filter(e => e.event_type === 'membership.went_invalid');
      
      if (payments.length > 0) {
        textPool.push({
          text: `Revenue: ${payments.length} successful payments recorded`,
          source: 'payment_analytics',
          date: new Date().toISOString()
        });
      }
      
      if (refunds.length > 0) {
        textPool.push({
          text: `Refunds: ${refunds.length} refunds issued - potential dissatisfaction signal`,
          source: 'refund_analytics',
          date: new Date().toISOString()
        });
      }
      
      if (cancellations.length > 0) {
        textPool.push({
          text: `Churn Alert: ${cancellations.length} memberships cancelled or expired`,
          source: 'churn_analytics',
          date: new Date().toISOString()
        });
      }
    }

    // Extract subscription insights
    if (subscriptions && subscriptions.length > 0) {
      const activeCount = subscriptions.filter(s => s.status === 'active').length;
      const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length;
      const churnRate = subscriptions.length > 0 ? (cancelledCount / subscriptions.length * 100).toFixed(1) : '0';
      
      textPool.push({
        text: `Subscription Health: ${activeCount} active, ${cancelledCount} cancelled (${churnRate}% churn rate)`,
        source: 'subscription_analytics',
        date: new Date().toISOString()
      });
    }

    const allTexts = textPool;

    // Scrub PII from all texts
    const scrubbedTexts = allTexts.map(item => ({
      ...item,
      text: scrubText(item.text)
    }));

    // MUST have OpenAI configured - no bullshit fallbacks
    console.log('🔍 AI Generation Check:', {
      hasOpenAI: !!openai,
      hasAPIKey: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      textCount: scrubbedTexts.length
    });
    
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.error('❌ FATAL: OpenAI not configured');
      throw new Error('OpenAI API key not found. Check Vercel environment variables.');
    }
    
    console.log('🤖 Attempting OpenAI API call...');
    console.log('📊 Data being sent to OpenAI:', {
      textCount: scrubbedTexts.length,
      sampleText: scrubbedTexts[0]?.text?.substring(0, 100) + '...' || 'No text'
    });
    
    // Generate insights using OpenAI - throw error if fails
    const result = await generateWithOpenAI(scrubbedTexts);
    const isAIGenerated = true;
    
    console.log('✅ OpenAI API success! Generated themes:', result.themes.length);

    // Store insights in database
    const insights = await storeInsights(clientId, result, isAIGenerated);

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
 * Generate insights using OpenAI with enhanced engagement and sentiment analysis
 */
export async function generateWithOpenAI(texts: any[]): Promise<AIAnalysisResult> {
  const textSample = texts.slice(0, 30).map(t => t.text).join('\n---\n');

  const prompt = `You are an expert AI analyst for online course/membership businesses. Analyze ${texts.length} data points including survey responses, event patterns, subscription metrics, and behavioral analytics.

Provide actionable insights focused on:

1. REVENUE & CHURN: Payment patterns, cancellations, refund trends, retention issues
2. ENGAGEMENT METRICS: Activity patterns, drop-off points, student participation
3. SENTIMENT ANALYSIS: Customer satisfaction, pain points, positive feedback
4. TREND IDENTIFICATION: Emerging patterns, recurring issues, growth opportunities
5. PERFORMANCE OPTIMIZATION: Specific areas for improvement with clear metrics

For EACH insight, provide:
- title: Specific, descriptive name (include module/lesson if mentioned)
- share_pct: Realistic percentage of responses mentioning this (0-100)
- sentiment: positive, negative, or neutral
- suggested_action: SPECIFIC, detailed action with metrics and examples
- urgency: low, medium, or high

FOCUS ON ACTIONABLE INSIGHTS. Be specific about:
- Which modules/lessons have issues
- Specific technical problems (video quality, loading, mobile issues)
- Content gaps or confusion points
- Engagement patterns and drop-off points
- Positive feedback to amplify

Example of EXCELLENT insight:
{
  "title": "Mobile video crashes in Module 3 (Real Estate Law)",
  "share_pct": 23,
  "sentiment": "negative",
  "suggested_action": "Fix mobile video player for Module 3 - 23% of students report crashes. Implement adaptive bitrate streaming and test on iOS/Android. Consider breaking 45-min video into 3 shorter segments.",
  "urgency": "high"
}

Example of GOOD engagement insight:
{
  "title": "High drop-off after Module 2 quiz",
  "share_pct": 18,
  "sentiment": "negative", 
  "suggested_action": "Redesign Module 2 quiz - 18% of students drop off here. Make quiz less intimidating, add hints, or break into smaller assessments. Consider pre-quiz preparation materials.",
  "urgency": "medium"
}

Student Feedback Data:
${textSample}

Return JSON with 4-5 focused insights, summary, and key takeaways:
{
  "themes": [
    { "title": "...", "share_pct": 25, "sentiment": "negative", "suggested_action": "...", "urgency": "high" },
    { "title": "...", "share_pct": 40, "sentiment": "positive", "suggested_action": "...", "urgency": "low" }
  ],
  "summary": "2-3 sentence overview highlighting key engagement patterns and sentiment trends",
  "key_takeaways": ["Specific actionable takeaway 1", "Specific takeaway 2", "Specific takeaway 3"]
}`;

  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized - OPENAI_API_KEY not set');
    }

    // Use OpenAI SDK with enhanced parameters for better insights
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model for insights
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert AI analyst specializing in online education and course optimization. You excel at identifying engagement patterns, sentiment trends, and actionable recommendations. Always provide specific, data-driven insights with clear metrics and examples. Return only valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }, // Ensures structured JSON output
      temperature: 0.7, // Balanced creativity and consistency
      max_tokens: 1500, // Increased for more detailed insights
      top_p: 0.9, // Nucleus sampling for better quality
      frequency_penalty: 0.1, // Reduces repetition
      presence_penalty: 0.1, // Encourages topic diversity
    });

    const resultText = response.choices[0].message.content;
    if (!resultText) {
      throw new Error('OpenAI returned empty response');
    }
    
    const result = JSON.parse(resultText);
    return result as AIAnalysisResult;
  } catch (error: any) {
    console.error('Failed to use OpenAI:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    throw error;
  }
}

/**
 * Generate stub analysis when OpenAI is not available
 */
// REMOVED: generateStubAnalysis - No fallback fake insights allowed
// AI insights must be real or fail with a clear error message

/**
 * Store insights in database
 */
async function storeInsights(clientId: string, result: AIAnalysisResult, isAIGenerated: boolean = false): Promise<any[]> {
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
      ai_generated: isAIGenerated, // Only true if actually from OpenAI
      model: isAIGenerated ? 'gpt-4o-mini' : 'stub'
    }
  }));

  const { data, error } = await supabase
    .from('insights')
    .insert(insights)
    .select();

  if (error) throw error;
  return data || [];
}

// REMOVED: getStubInsights - No fake insights allowed

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
