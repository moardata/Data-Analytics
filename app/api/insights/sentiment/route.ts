/**
 * Sentiment Analysis API
 * Uses OpenAI to perform advanced sentiment analysis on student feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    // Get the client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id;
    const body = await request.json();
    const { text, timeRange = 'week' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for sentiment analysis' },
        { status: 400 }
      );
    }

    // Perform sentiment analysis using OpenAI
    const sentimentResult = await analyzeSentimentWithOpenAI(text);

    // Store the analysis result
    const { data: insight } = await supabase
      .from('insights')
      .insert({
        client_id: clientId,
        title: 'Sentiment Analysis',
        content: `Sentiment: ${sentimentResult.sentiment} (${sentimentResult.confidence}% confidence). ${sentimentResult.explanation}`,
        insight_type: 'sentiment_analysis',
        metadata: {
          sentiment: sentimentResult.sentiment,
          confidence: sentimentResult.confidence,
          emotions: sentimentResult.emotions,
          topics: sentimentResult.topics,
          ai_generated: true,
          model: 'gpt-4o-mini'
        }
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      sentiment: sentimentResult,
      insight: insight
    });

  } catch (error: any) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}

async function analyzeSentimentWithOpenAI(text: string) {
  const prompt = `Analyze the sentiment and emotional tone of the following student feedback text. Provide a comprehensive analysis including:

1. Overall sentiment (positive, negative, neutral)
2. Confidence level (0-100%)
3. Key emotions detected
4. Main topics/themes
5. Brief explanation of the analysis

Text to analyze:
"${text}"

Return JSON in this format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 85,
  "emotions": ["satisfaction", "frustration", "excitement"],
  "topics": ["course content", "technical issues", "instructor"],
  "explanation": "Brief explanation of why this sentiment was detected"
}`;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert sentiment analysis AI. You excel at detecting emotional nuances, sentiment patterns, and underlying themes in student feedback. Be precise and provide confidence levels based on the clarity of the sentiment indicators.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent sentiment analysis
      max_tokens: 500
    });

    const resultText = completion.choices[0].message.content;
    const result = JSON.parse(resultText);
    
    return result;
  } catch (error) {
    console.error('Failed to analyze sentiment with OpenAI:', error);
    // Fallback to simple sentiment analysis
    return {
      sentiment: analyzeSimpleSentiment(text),
      confidence: 60,
      emotions: ['unknown'],
      topics: ['general feedback'],
      explanation: 'Fallback analysis due to API error'
    };
  }
}

function analyzeSimpleSentiment(text: string): string {
  const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'helpful', 'good', 'awesome', 'fantastic', 'wonderful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'confusing', 'difficult', 'boring', 'slow', 'frustrating', 'disappointed'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}
