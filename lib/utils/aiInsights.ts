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

    // Get survey responses with enhanced data
    const { data: formSubmissions } = await supabase
      .from('form_submissions')
      .select(`
        responses, 
        submitted_at,
        form_templates(name, description),
        entities(name, email)
      `)
      .eq('client_id', clientId)
      .gte('submitted_at', startDate)
      .order('submitted_at', { ascending: false })
      .limit(100);

    // Get engagement data for context
    const { data: engagementEvents } = await supabase
      .from('events')
      .select('event_type, event_data, created_at')
      .eq('client_id', clientId)
      .eq('event_type', 'engagement')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    // Get course completion data
    const { data: completionEvents } = await supabase
      .from('events')
      .select('event_type, event_data, created_at')
      .eq('client_id', clientId)
      .in('event_type', ['course_enrollment', 'course_completion'])
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

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

    // Extract text from form responses with enhanced context
    const textPool = formSubmissions.flatMap(submission => {
      const texts: any[] = [];
      const formName = (submission.form_templates as any)?.name || 'Unknown Form';
      const studentName = (submission.entities as any)?.name || 'Anonymous';
      
      Object.values(submission.responses || {}).forEach(value => {
        if (typeof value === 'string' && value.length > 10) {
          texts.push({
            id: Math.random().toString(),
            text: value,
            source: 'form_submission',
            formName: formName,
            studentName: studentName,
            created_at: submission.submitted_at
          });
        }
      });
      return texts;
    });

    // Add engagement context
    const engagementContext = engagementEvents?.map(event => ({
      id: Math.random().toString(),
      text: `Engagement: ${event.event_data?.action || 'activity'} at ${new Date(event.created_at).toLocaleDateString()}`,
      source: 'engagement_log',
      created_at: event.created_at
    })) || [];

    // Add completion context
    const completionContext = completionEvents?.map(event => ({
      id: Math.random().toString(),
      text: `Course Progress: ${event.event_type} - ${event.event_data?.action || 'activity'}`,
      source: 'completion_log',
      created_at: event.created_at
    })) || [];

    // Combine all text sources
    const allTexts = [...textPool, ...engagementContext, ...completionContext];

    // Scrub PII from all texts
    const scrubbedTexts = allTexts.map(item => ({
      ...item,
      text: scrubText(item.text)
    }));

    // Generate insights using AI or stub
    let result: AIAnalysisResult;
    
    console.log('🔍 AI Generation Check:', {
      hasOpenAI: !!openai,
      hasAPIKey: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      textCount: scrubbedTexts.length
    });
    
    let isAIGenerated = false;
    
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Attempting OpenAI API call...');
        console.log('📊 Data being sent to OpenAI:', {
          textCount: scrubbedTexts.length,
          sampleText: scrubbedTexts[0]?.substring(0, 100) + '...' || 'No text'
        });
        
        result = await generateWithOpenAI(scrubbedTexts);
        isAIGenerated = true;
        console.log('✅ OpenAI API success! Generated themes:', result.themes.length);
      } catch (error: any) {
        console.error('❌ OpenAI API failed:', {
          message: error.message,
          status: error.status,
          code: error.code,
          type: error.type,
          stack: error.stack?.substring(0, 500)
        });
        result = generateStubAnalysis(scrubbedTexts);
        isAIGenerated = false;
        console.log('⚠️ Using stub insights as fallback');
      }
    } else {
      console.log('⚠️ OpenAI not configured, using stub insights');
      result = generateStubAnalysis(scrubbedTexts);
      isAIGenerated = false;
    }

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
async function generateWithOpenAI(texts: any[]): Promise<AIAnalysisResult> {
  const textSample = texts.slice(0, 30).map(t => t.text).join('\n---\n');

  const prompt = `You are an expert AI analyst for online course creators. Analyze ${texts.length} student feedback responses and provide actionable insights focused on:

1. ENGAGEMENT METRICS: Course completion rates, drop-off points, student activity patterns
2. SENTIMENT ANALYSIS: Overall student satisfaction, pain points, positive feedback
3. TREND IDENTIFICATION: Emerging patterns, recurring issues, success factors
4. PERFORMANCE OPTIMIZATION: Specific areas for improvement with clear metrics

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
    // Use Chat Completions API with enhanced parameters for better insights
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
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
        stream: false // Ensure complete response
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
