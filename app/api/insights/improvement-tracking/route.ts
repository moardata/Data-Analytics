import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { clientId, insightId, actionId, newMetrics } = await request.json();
    
    // Use the imported supabase client
    
    // Get the original metrics from the action
    const { data: actionData, error: actionError } = await supabase
      .from('insight_actions')
      .select('metrics_before, metrics_after')
      .eq('id', actionId)
      .single();

    if (actionError) {
      console.error('Error fetching action data:', actionError);
      return NextResponse.json({ error: 'Failed to fetch action data' }, { status: 500 });
    }

    // Calculate improvement metrics
    const improvementMetrics = calculateImprovementMetrics(
      actionData.metrics_before,
      newMetrics
    );

    // Store improvement tracking record
    const { data: improvementData, error: improvementError } = await supabase
      .from('improvement_tracking')
      .insert({
        client_id: clientId,
        insight_id: insightId,
        action_id: actionId,
        metrics_before: actionData.metrics_before,
        metrics_after: newMetrics,
        improvement_percentage: improvementMetrics.percentage,
        improvement_summary: improvementMetrics.summary,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (improvementError) {
      console.error('Error storing improvement:', improvementError);
      return NextResponse.json({ error: 'Failed to store improvement' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      improvementId: improvementData.id,
      metrics: improvementMetrics
    });

  } catch (error) {
    console.error('Improvement tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    // Use the imported supabase client
    
    // Get improvement tracking data for this client
    const { data: improvements, error } = await supabase
      .from('improvement_tracking')
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching improvements:', error);
      return NextResponse.json({ error: 'Failed to fetch improvements' }, { status: 500 });
    }

    // Calculate overall improvement summary
    const summary = calculateOverallImprovementSummary(improvements);

    return NextResponse.json({ 
      improvements,
      summary
    });

  } catch (error) {
    console.error('Improvement tracking GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateImprovementMetrics(before: any, after: any) {
  if (!before || !after) {
    return {
      percentage: 0,
      summary: 'No comparison data available'
    };
  }

  const improvements: Array<{
    metric: string;
    before: number;
    after: number;
    improvement: number;
  }> = [];
  let totalImprovement = 0;
  let metricCount = 0;

  // Compare key metrics
  const metricsToCompare = [
    'completion_rate',
    'engagement_score',
    'satisfaction_score',
    'retention_rate',
    'revenue_per_user'
  ];

  metricsToCompare.forEach(metric => {
    if (before[metric] !== undefined && after[metric] !== undefined) {
      const beforeValue = parseFloat(before[metric]) || 0;
      const afterValue = parseFloat(after[metric]) || 0;
      
      if (beforeValue > 0) {
        const improvement = ((afterValue - beforeValue) / beforeValue) * 100;
        improvements.push({
          metric,
          before: beforeValue,
          after: afterValue,
          improvement: improvement
        });
        totalImprovement += improvement;
        metricCount++;
      }
    }
  });

  const averageImprovement = metricCount > 0 ? totalImprovement / metricCount : 0;

  return {
    percentage: Math.round(averageImprovement * 100) / 100,
    summary: generateImprovementSummary(improvements, averageImprovement),
    details: improvements
  };
}

function calculateOverallImprovementSummary(improvements: any[]) {
  if (!improvements || improvements.length === 0) {
    return {
      totalActions: 0,
      averageImprovement: 0,
      bestImprovement: 0,
      totalMetricsImproved: 0
    };
  }

  const totalActions = improvements.length;
  const averageImprovement = improvements.reduce((sum, imp) => sum + (imp.improvement_percentage || 0), 0) / totalActions;
  const bestImprovement = Math.max(...improvements.map(imp => imp.improvement_percentage || 0));
  const totalMetricsImproved = improvements.filter(imp => (imp.improvement_percentage || 0) > 0).length;

  return {
    totalActions,
    averageImprovement: Math.round(averageImprovement * 100) / 100,
    bestImprovement: Math.round(bestImprovement * 100) / 100,
    totalMetricsImproved,
    improvementRate: Math.round((totalMetricsImproved / totalActions) * 100)
  };
}

function generateImprovementSummary(improvements: any[], averageImprovement: number) {
  if (improvements.length === 0) {
    return 'No measurable improvements detected';
  }

  const positiveImprovements = improvements.filter(imp => imp.improvement > 0);
  const negativeImprovements = improvements.filter(imp => imp.improvement < 0);

  if (positiveImprovements.length === improvements.length) {
    return `All metrics improved with average gain of ${Math.round(averageImprovement)}%`;
  } else if (negativeImprovements.length === improvements.length) {
    return `Metrics declined with average loss of ${Math.round(Math.abs(averageImprovement))}%`;
  } else {
    return `Mixed results: ${positiveImprovements.length} improved, ${negativeImprovements.length} declined`;
  }
}
