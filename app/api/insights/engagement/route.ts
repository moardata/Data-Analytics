/**
 * Engagement Analysis API
 * Provides detailed engagement metrics and drop-off analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

export async function GET(request: NextRequest) {
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

    // Get engagement data from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    // Get form submissions for engagement analysis
    const { data: submissions, error: submissionsError } = await supabase
      .from('form_submissions')
      .select('submitted_at, responses')
      .eq('client_id', clientId)
      .gte('submitted_at', thirtyDaysAgo)
      .order('submitted_at', { ascending: false });

    console.log(`📊 [Engagement API] Submissions for company ${companyId}:`, {
      count: submissions?.length || 0,
      clientId,
      error: submissionsError?.message
    });

    // Get events for activity tracking
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('event_type, created_at, event_data')
      .eq('client_id', clientId)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false });

    console.log(`📊 [Engagement API] Events for company ${companyId}:`, {
      count: events?.length || 0,
      clientId,
      error: eventsError?.message
    });

    // Calculate engagement metrics
    const engagementMetrics = calculateEngagementMetrics(submissions || [], events || []);
    
    console.log(`📊 [Engagement API] Metrics calculated:`, {
      hasMetrics: !!engagementMetrics,
      companyId
    });

    return NextResponse.json({
      success: true,
      metrics: engagementMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error analyzing engagement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze engagement' },
      { status: 500 }
    );
  }
}

function calculateEngagementMetrics(submissions: any[], events: any[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  // Calculate submission trends
  const submissionsByDay = submissions.reduce((acc, sub) => {
    const day = new Date(sub.submitted_at).toDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate activity trends
  const eventsByDay = events.reduce((acc, event) => {
    const day = new Date(event.created_at).toDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate weekly vs monthly trends
  const recentSubmissions = submissions.filter(s => new Date(s.submitted_at) >= sevenDaysAgo).length;
  const olderSubmissions = submissions.filter(s => {
    const date = new Date(s.submitted_at);
    return date >= thirtyDaysAgo && date < sevenDaysAgo;
  }).length;

  const recentEvents = events.filter(e => new Date(e.created_at) >= sevenDaysAgo).length;
  const olderEvents = events.filter(e => {
    const date = new Date(e.created_at);
    return date >= thirtyDaysAgo && date < sevenDaysAgo;
  }).length;

  // Calculate engagement score (0-100)
  const totalSubmissions = submissions.length;
  const totalEvents = events.length;
  const engagementScore = Math.min(100, Math.round((totalSubmissions * 2 + totalEvents) / 10));

  // Calculate drop-off patterns
  const dropOffAnalysis = analyzeDropOffs(submissions);

  // Calculate sentiment trends
  const sentimentAnalysis = analyzeSentiment(submissions);

  return {
    overview: {
      engagementScore,
      totalSubmissions,
      totalEvents,
      activeDays: Object.keys(submissionsByDay).length,
      avgSubmissionsPerDay: totalSubmissions / 30
    },
    trends: {
      submissions: {
        recent: recentSubmissions,
        previous: olderSubmissions,
        change: olderSubmissions > 0 ? ((recentSubmissions - olderSubmissions) / olderSubmissions * 100) : 0
      },
      activity: {
        recent: recentEvents,
        previous: olderEvents,
        change: olderEvents > 0 ? ((recentEvents - olderEvents) / olderEvents * 100) : 0
      }
    },
    dropOffs: dropOffAnalysis,
    sentiment: sentimentAnalysis,
    dailyActivity: {
      submissions: submissionsByDay,
      events: eventsByDay
    }
  };
}

function analyzeDropOffs(submissions: any[]) {
  // Analyze patterns in submission timing and content
  const dropOffPoints: string[] = [];
  
  // Check for common drop-off indicators in responses
  submissions.forEach(sub => {
    const responses = sub.responses || {};
    Object.values(responses).forEach((response: any) => {
      if (typeof response === 'string') {
        const text = response.toLowerCase();
        if (text.includes('confused') || text.includes('difficult') || text.includes('stuck')) {
          dropOffPoints.push('Content confusion');
        }
        if (text.includes('technical') || text.includes('bug') || text.includes('error')) {
          dropOffPoints.push('Technical issues');
        }
        if (text.includes('boring') || text.includes('slow') || text.includes('long')) {
          dropOffPoints.push('Engagement issues');
        }
      }
    });
  });

  // Count drop-off reasons
  const dropOffCounts = dropOffPoints.reduce((acc, reason) => {
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalDropOffs: dropOffPoints.length,
    reasons: dropOffCounts,
    topReason: Object.keys(dropOffCounts).reduce((a, b) => dropOffCounts[a] > dropOffCounts[b] ? a : b, '') || 'No drop-offs detected'
  };
}

function analyzeSentiment(submissions: any[]) {
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'helpful', 'good', 'awesome'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'confusing', 'difficult', 'boring', 'slow'];

  submissions.forEach(sub => {
    const responses = sub.responses || {};
    Object.values(responses).forEach((response: any) => {
      if (typeof response === 'string') {
        const text = response.toLowerCase();
        const positiveMatches = positiveWords.filter(word => text.includes(word)).length;
        const negativeMatches = negativeWords.filter(word => text.includes(word)).length;
        
        if (positiveMatches > negativeMatches) {
          positiveCount++;
        } else if (negativeMatches > positiveMatches) {
          negativeCount++;
        } else {
          neutralCount++;
        }
      }
    });
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
