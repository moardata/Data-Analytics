/**
 * OpenAI Client Configuration
 * Traditional Chat Completions API (alternative to Responses API)
 * Use openai-responses.ts for the newer gpt-5-nano Responses API
 */

import OpenAI from 'openai';

// ALWAYS create fresh OpenAI client to avoid caching old API keys
function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  
  console.log('🔑 [openai-client] Creating fresh OpenAI with key ending:', key ? '...' + key.substring(key.length - 10) : 'NO KEY');
  
  // Always create new instance - no caching!
  return new OpenAI({
    apiKey: key,
  });
}

// Don't use proxy - always call getOpenAI() directly
export { getOpenAI as openai };

/**
 * Generate insights from course feedback
 */
export async function generateCourseInsights(
  feedback: string[],
  metrics: {
    totalStudents: number;
    engagementRate: number;
    completionRate: number;
  }
): Promise<string> {
  try {
    const prompt = `You are an expert course analytics AI. Analyze this student feedback and metrics to provide actionable insights for a course creator.

Metrics:
- Total Students: ${metrics.totalStudents}
- Engagement Rate: ${metrics.engagementRate.toFixed(1)}%
- Completion Rate: ${metrics.completionRate.toFixed(1)}%

Student Feedback:
${feedback.slice(0, 20).join('\n- ')}

Generate 3-5 specific, actionable insights in this format:
1. [Insight Title]: [2-3 sentence explanation with data-backed recommendation]

Focus on:
- Patterns in student feedback
- Areas for improvement
- Strengths to amplify
- Specific action items`;

    const completion = await openai().chat.completions.create({
      model: 'gpt-3.5-turbo', // or gpt-4 for better quality
      messages: [
        {
          role: 'system',
          content: 'You are a course analytics expert who provides actionable insights based on student data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0].message.content || 'No insights generated';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate insights');
  }
}

/**
 * Analyze sentiment of feedback text
 */
export async function analyzeSentiment(texts: string[]): Promise<{
  positive: number;
  neutral: number;
  negative: number;
  themes: string[];
}> {
  try {
    const completion = await openai().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Analyze sentiment and extract themes from course feedback. Return JSON only.'
        },
        {
          role: 'user',
          content: `Analyze this feedback and return JSON with: positive_count, neutral_count, negative_count, themes (array of 3-5 common themes)\n\n${texts.join('\n')}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      positive: result.positive_count || 0,
      neutral: result.neutral_count || 0,
      negative: result.negative_count || 0,
      themes: result.themes || [],
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { positive: 0, neutral: 0, negative: 0, themes: [] };
  }
}

/**
 * Check if OpenAI API is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-api-key-here';
}

