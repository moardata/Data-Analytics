import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateWithOpenAI } from '@/lib/utils/aiInsights';

export async function POST(request: NextRequest) {
  try {
    const { clientId, insightId, actionId } = await request.json();
    
    const supabase = createClient();
    
    // Get improvement tracking data
    const { data: improvementData, error: improvementError } = await supabase
      .from('improvement_tracking')
      .select(`
        *,
        insights!inner(
          id,
          title,
          category,
          content
        ),
        insight_actions!inner(
          action_type,
          improvement_description
        )
      `)
      .eq('id', actionId)
      .single();

    if (improvementError) {
      console.error('Error fetching improvement data:', improvementError);
      return NextResponse.json({ error: 'Failed to fetch improvement data' }, { status: 500 });
    }

    // Generate AI-powered improvement summary
    const improvementSummary = await generateImprovementSummary(improvementData);

    // Store the generated summary
    const { data: summaryData, error: summaryError } = await supabase
      .from('improvement_summaries')
      .insert({
        client_id: clientId,
        insight_id: insightId,
        action_id: actionId,
        improvement_id: improvementData.id,
        summary_content: improvementSummary.content,
        key_metrics: improvementSummary.keyMetrics,
        recommendations: improvementSummary.recommendations,
        confidence_score: improvementSummary.confidence,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (summaryError) {
      console.error('Error storing summary:', summaryError);
      return NextResponse.json({ error: 'Failed to store summary' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      summaryId: summaryData.id,
      summary: improvementSummary
    });

  } catch (error) {
    console.error('Improvement summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get improvement summaries for this client
    const { data: summaries, error } = await supabase
      .from('improvement_summaries')
      .select(`
        *,
        insights!inner(
          id,
          title,
          category
        ),
        insight_actions!inner(
          action_type,
          improvement_description
        )
      `)
      .eq('client_id', clientId)
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching summaries:', error);
      return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 });
    }

    return NextResponse.json({ summaries });

  } catch (error) {
    console.error('Improvement summary GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateImprovementSummary(improvementData: any) {
  const prompt = `
You are an AI assistant analyzing course improvement results. Based on the following data, generate a comprehensive improvement summary.

ORIGINAL INSIGHT:
- Title: ${improvementData.insights?.title || 'N/A'}
- Category: ${improvementData.insights?.category || 'N/A'}
- Content: ${improvementData.insights?.content || 'N/A'}

ACTION TAKEN:
- Type: ${improvementData.insight_actions?.action_type || 'N/A'}
- Description: ${improvementData.insight_actions?.improvement_description || 'N/A'}

IMPROVEMENT METRICS:
- Before: ${JSON.stringify(improvementData.metrics_before || {})}
- After: ${JSON.stringify(improvementData.metrics_after || {})}
- Improvement Percentage: ${improvementData.improvement_percentage || 0}%

Please provide a structured analysis focusing on:
1. Key metrics that improved or declined
2. Specific areas of success
3. Areas that need further attention
4. Recommendations for continued improvement
5. Overall assessment of the action's effectiveness

Format your response as JSON with the following structure:
{
  "content": "Overall summary of the improvement results",
  "keyMetrics": [
    {
      "metric": "metric_name",
      "before": "value_before",
      "after": "value_after",
      "change": "percentage_change",
      "status": "improved|declined|unchanged"
    }
  ],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ],
  "confidence": 0.85
}
`;

  try {
    const response = await generateWithOpenAI(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating improvement summary:', error);
    return {
      content: 'Unable to generate AI summary at this time',
      keyMetrics: [],
      recommendations: ['Review the data manually for insights'],
      confidence: 0.0
    };
  }
}
