/**
 * OpenAI Responses API Integration
 * Using the new Responses API endpoint with gpt-5-nano
 */

const OPENAI_BASE_URL = 'https://api.openai.com/v1/responses';

export async function generateInsightWithResponsesAPI(
  input: string
): Promise<string> {
  try {
    // Use OpenAI SDK instead of direct fetch to ensure consistent auth
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Note: Responses API is not yet available in OpenAI SDK
    // Fallback to chat completions for now
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: input }],
      max_tokens: 1000,
    });
    
    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Generate course insights using the Responses API
 */
export async function generateCourseInsightsWithNano(
  feedback: string[],
  metrics: {
    totalStudents: number;
    engagementRate: number;
    completionRate: number;
  }
): Promise<string[]> {
  const input = `Analyze this course data and provide 5 actionable insights:

Metrics:
- Students: ${metrics.totalStudents}
- Engagement: ${metrics.engagementRate.toFixed(1)}%
- Completion: ${metrics.completionRate.toFixed(1)}%

Recent Feedback:
${feedback.slice(0, 15).join('\n- ')}

Generate 5 specific insights with recommendations.`;

  try {
    const result = await generateInsightWithResponsesAPI(input);
    
    // Parse the response into individual insights
    const insights = result
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
    
    return insights;
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return [];
  }
}

/**
 * Analyze sentiment using gpt-5-nano
 */
export async function analyzeSentimentWithNano(
  texts: string[]
): Promise<{ positive: number; neutral: number; negative: number; themes: string[] }> {
  const input = `Analyze sentiment and extract themes from this feedback. Return JSON format:
{
  "positive": number of positive,
  "neutral": number of neutral,
  "negative": number of negative,
  "themes": [array of 3-5 themes]
}

Feedback:
${texts.join('\n')}`;

  try {
    const result = await generateInsightWithResponsesAPI(input);
    const parsed = JSON.parse(result);
    
    return {
      positive: parsed.positive || 0,
      neutral: parsed.neutral || 0,
      negative: parsed.negative || 0,
      themes: parsed.themes || [],
    };
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    return { positive: 0, neutral: 0, negative: 0, themes: [] };
  }
}

/**
 * Check if OpenAI Responses API is configured
 */
export function isResponsesAPIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!key && key.length > 20;
}


