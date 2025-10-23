/**
 * Enhanced AI Processing System
 * Analyzes student data for specific patterns and returns structured insights
 */

import OpenAI from 'openai';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { scrubText } from './piiScrubber';

// ALWAYS create fresh OpenAI client to avoid caching old API keys
function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  
  // Always create new instance - don't cache!
  return new OpenAI({ apiKey: key });
}

const openai = null; // Never used - we always call getOpenAI() fresh

export interface AIInsight {
  insight: string;
  recommendation: string;
  category: 'drop_off' | 'sentiment' | 'engagement' | 'pacing' | 'clarity' | 'general';
  confidence: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  dataPoints: number;
  affectedStudents?: number;
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  summary: string;
  keyFindings: string[];
  confidence: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Enhanced AI processing with structured analysis
 */
export async function processDataWithAI(
  clientId: string,
  timeRange: string = 'week'
): Promise<AIAnalysisResult> {
  try {
    console.log('🤖 [AI Processing] Starting enhanced analysis for client:', clientId);

    // Collect comprehensive data
    const dataCollection = await collectComprehensiveData(clientId, timeRange);
    
    if (!dataCollection.hasData) {
      throw new Error('No student feedback data available. Please collect survey responses before generating insights.');
    }

    // Prepare data for AI analysis
    const analysisData = prepareDataForAnalysis(dataCollection);
    
    // Fail fast if OpenAI is not configured
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.error('❌ [AI Processing] OpenAI not configured');
      throw new Error('OpenAI API key is required for AI insights generation. Please configure OPENAI_API_KEY in your environment variables.');
    }

    // Perform AI analysis with structured prompts - throw error if fails
    const aiResult = await performStructuredAIAnalysis(analysisData);
    
    // Store insights in database
    await storeAIInsights(clientId, aiResult);

    return aiResult;

  } catch (error) {
    console.error('❌ [AI Processing] Error in AI analysis:', error);
    // Re-throw the error instead of returning a fake result
    throw error;
  }
}

/**
 * Collects comprehensive data for AI analysis
 */
async function collectComprehensiveData(clientId: string, timeRange: string) {
  const daysAgo = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
  const startDate = new Date(Date.now() - daysAgo * 86400000).toISOString();

  // Get all relevant data
  const [surveyData, engagementData, completionData, studentData] = await Promise.all([
    // Survey responses
    supabase
      .from('form_submissions')
      .select(`
        id, responses, submitted_at,
        form_templates(name, description, fields),
        entities(name, email)
      `)
      .eq('client_id', clientId)
      .gte('submitted_at', startDate)
      .order('submitted_at', { ascending: false }),

    // Engagement events
    supabase
      .from('events')
      .select('event_type, event_data, created_at, entities(name)')
      .eq('client_id', clientId)
      .in('event_type', ['engagement', 'activity', 'course_access'])
      .gte('created_at', startDate)
      .order('created_at', { ascending: false }),

    // Completion data
    supabase
      .from('events')
      .select('event_type, event_data, created_at, entities(name)')
      .eq('client_id', clientId)
      .in('event_type', ['course_enrollment', 'course_completion', 'lesson_completed'])
      .gte('created_at', startDate)
      .order('created_at', { ascending: false }),

    // Student profiles
    supabase
      .from('entities')
      .select('id, name, email, created_at, metadata')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
  ]);

  return {
    surveyResponses: surveyData.data || [],
    engagementEvents: engagementData.data || [],
    completionEvents: completionData.data || [],
    students: studentData.data || [],
    hasData: (surveyData.data?.length || 0) > 0,
    timeRange: daysAgo
  };
}

/**
 * Prepares data for AI analysis with specific focus areas
 */
function prepareDataForAnalysis(data: any) {
  // Extract survey text with context
  const surveyTexts = data.surveyResponses.flatMap((response: any) => {
    const texts: any[] = [];
    const formName = response.form_templates?.name || 'Unknown Form';
    const studentName = response.entities?.name || 'Anonymous';
    
    Object.entries(response.responses || {}).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 10) {
        texts.push({
          text: value,
          formName,
          studentName,
          submittedAt: response.submitted_at,
          fieldType: response.form_templates?.fields?.find((f: any) => f.id === key)?.type || 'text'
        });
      }
    });
    return texts;
  });

  // Analyze engagement patterns
  const engagementPatterns = analyzeEngagementPatterns(data.engagementEvents);
  
  // Analyze completion patterns
  const completionPatterns = analyzeCompletionPatterns(data.completionEvents);
  
  // Calculate sentiment trends
  const sentimentTrends = calculateSentimentTrends(surveyTexts);
  
  // Identify drop-off points
  const dropOffPoints = identifyDropOffPoints(data.completionEvents, data.engagementEvents);

  return {
    surveyTexts: surveyTexts.slice(0, 50), // Limit for API efficiency
    engagementPatterns,
    completionPatterns,
    sentimentTrends,
    dropOffPoints,
    totalStudents: data.students.length,
    totalResponses: surveyTexts.length,
    timeRange: data.timeRange
  };
}

/**
 * Performs structured AI analysis with specific focus areas
 */
async function performStructuredAIAnalysis(data: any): Promise<AIAnalysisResult> {
  const prompt = `You are an expert AI analyst for online education platforms. Analyze the following student data and provide structured insights focusing on:

1. DROP-OFF POINTS: Where students are leaving or struggling
2. NEGATIVE SENTIMENT TRENDS: Patterns in dissatisfaction or frustration
3. ENGAGEMENT vs SATISFACTION CORRELATION: How engagement affects satisfaction
4. COURSE PACING/CLARITY ISSUES: Problems with content delivery or understanding

STUDENT DATA:
- Total Students: ${data.totalStudents}
- Survey Responses: ${data.totalResponses}
- Time Range: ${data.timeRange} days

SURVEY FEEDBACK:
${data.surveyTexts.map((item: any) => 
  `[${item.formName}] ${item.studentName}: "${item.text}" (${item.fieldType})`
).join('\n')}

ENGAGEMENT PATTERNS:
${JSON.stringify(data.engagementPatterns, null, 2)}

COMPLETION PATTERNS:
${JSON.stringify(data.completionPatterns, null, 2)}

SENTIMENT TRENDS:
${JSON.stringify(data.sentimentTrends, null, 2)}

DROP-OFF POINTS:
${JSON.stringify(data.dropOffPoints, null, 2)}

Return structured JSON with specific insights:
{
  "insights": [
    {
      "insight": "Specific finding with data points",
      "recommendation": "Actionable recommendation with examples",
      "category": "drop_off|sentiment|engagement|pacing|clarity|general",
      "confidence": 85,
      "severity": "low|medium|high|critical",
      "dataPoints": 15,
      "affectedStudents": 8
    }
  ],
  "summary": "2-3 sentence overview of key findings",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "confidence": 80,
  "dataQuality": "excellent|good|fair|poor"
}

Be specific, data-driven, and actionable. Focus on patterns that can be improved.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert AI analyst specializing in online education optimization. You excel at identifying drop-off points, sentiment trends, engagement patterns, and course issues. Provide specific, actionable insights with confidence levels.' 
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6, // Balanced for analysis
        max_tokens: 2000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    const analysis = JSON.parse(analysisText);
    
    console.log('✅ [AI Processing] Generated structured insights:', analysis.insights.length);
    return analysis as AIAnalysisResult;

  } catch (error) {
    console.error('Failed to perform AI analysis:', error);
    throw error;
  }
}

/**
 * Analyzes engagement patterns from event data
 */
function analyzeEngagementPatterns(events: any[]) {
  const patterns = {
    totalEvents: events.length,
    dailyActivity: events.reduce((acc, event) => {
      const date = new Date(event.created_at).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    eventTypes: events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averageDailyActivity: events.length / Math.max(Object.keys(events.reduce((acc, event) => {
      const date = new Date(event.created_at).toDateString();
      acc[date] = true;
      return acc;
    }, {} as Record<string, boolean>)).length, 1)
  };

  return patterns;
}

/**
 * Analyzes completion patterns
 */
function analyzeCompletionPatterns(events: any[]) {
  const completionEvents = events.filter(e => 
    e.event_type === 'course_completion' || 
    e.event_type === 'lesson_completed'
  );

  return {
    totalCompletions: completionEvents.length,
    completionRate: events.length > 0 ? (completionEvents.length / events.length) * 100 : 0,
    completionTypes: completionEvents.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

/**
 * Calculates sentiment trends from survey responses
 */
function calculateSentimentTrends(texts: any[]) {
  const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'helpful', 'good', 'awesome', 'fantastic', 'wonderful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'confusing', 'difficult', 'boring', 'slow', 'frustrating', 'disappointed'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  texts.forEach(item => {
    const text = item.text.toLowerCase();
    const positiveMatches = positiveWords.filter(word => text.includes(word)).length;
    const negativeMatches = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveMatches > negativeMatches) {
      positiveCount++;
    } else if (negativeMatches > positiveMatches) {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });

  const total = positiveCount + negativeCount + neutralCount;
  
  return {
    positive: positiveCount,
    negative: negativeCount,
    neutral: neutralCount,
    positivePercentage: total > 0 ? Math.round((positiveCount / total) * 100) : 0,
    negativePercentage: total > 0 ? Math.round((negativeCount / total) * 100) : 0,
    overallSentiment: positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral'
  };
}

/**
 * Identifies drop-off points in course progression
 */
function identifyDropOffPoints(completionEvents: any[], engagementEvents: any[]) {
  // Analyze patterns in completion vs engagement
  const dropOffs = [];
  
  // Check for engagement without completion
  const engagementWithoutCompletion = engagementEvents.filter(eng => 
    !completionEvents.some(comp => 
      comp.entities?.name === eng.entities?.name && 
      new Date(comp.created_at) > new Date(eng.created_at)
    )
  );

  if (engagementWithoutCompletion.length > 0) {
    dropOffs.push({
      type: 'engagement_without_completion',
      count: engagementWithoutCompletion.length,
      description: 'Students engaging but not completing'
    });
  }

  return dropOffs;
}

/**
 * Stores AI insights in the database
 */
async function storeAIInsights(clientId: string, result: AIAnalysisResult) {
  const insights = result.insights.map(insight => ({
    client_id: clientId,
    title: insight.insight,
    content: insight.recommendation,
    insight_type: insight.category,
    metadata: {
      confidence: insight.confidence,
      severity: insight.severity,
      dataPoints: insight.dataPoints,
      affectedStudents: insight.affectedStudents,
      ai_generated: true,
      model: 'gpt-4o-mini',
      structured_analysis: true
    }
  }));

  const { error } = await supabase
    .from('insights')
    .insert(insights);

  if (error) {
    console.error('Error storing AI insights:', error);
  } else {
    console.log(`✅ [AI Processing] Stored ${insights.length} insights`);
  }
}

// REMOVED: All fallback functions (generateFallbackAnalysis, getNoDataResult, getErrorResult)
// No fake insights allowed - must use real AI or fail with clear error message
