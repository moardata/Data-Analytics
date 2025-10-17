/**
 * Simple Test Endpoint - Bypasses Supabase entirely
 * Just returns mock data to test the dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId') || 'biz_test_demo';

  // Return mock dashboard data
  const mockData = {
    success: true,
    message: 'Mock data generated (bypassing database)',
    companyId,
    data: {
      // Mock analytics data
      students: [
        { id: '1', name: 'Alex Johnson', email: 'alex@example.com', status: 'active' },
        { id: '2', name: 'Sam Smith', email: 'sam@example.com', status: 'active' },
        { id: '3', name: 'Jordan Lee', email: 'jordan@example.com', status: 'active' },
        { id: '4', name: 'Taylor Brown', email: 'taylor@example.com', status: 'active' },
        { id: '5', name: 'Casey Davis', email: 'casey@example.com', status: 'active' },
      ],
      
      events: [
        { id: '1', type: 'signup', user: 'Alex Johnson', date: '2025-10-17', amount: null },
        { id: '2', type: 'purchase', user: 'Sam Smith', date: '2025-10-17', amount: 29.99 },
        { id: '3', type: 'lesson_complete', user: 'Jordan Lee', date: '2025-10-16', amount: null },
        { id: '4', type: 'purchase', user: 'Taylor Brown', date: '2025-10-16', amount: 19.99 },
        { id: '5', type: 'form_submit', user: 'Casey Davis', date: '2025-10-15', amount: null },
      ],
      
      subscriptions: [
        { id: '1', user: 'Alex Johnson', plan: 'core', status: 'active', amount: 20 },
        { id: '2', user: 'Sam Smith', plan: 'pulse', status: 'active', amount: 50 },
        { id: '3', user: 'Jordan Lee', plan: 'atom', status: 'active', amount: 0 },
        { id: '4', user: 'Taylor Brown', plan: 'core', status: 'active', amount: 20 },
        { id: '5', user: 'Casey Davis', plan: 'surge', status: 'active', amount: 100 },
      ],
      
      insights: [
        {
          id: '1',
          type: 'engagement',
          title: 'High Student Engagement Detected',
          content: '🎓 Your students are highly engaged! 70% have completed at least 3 activities in the past week.',
          recommendations: [
            'Consider creating advanced content for your most active students',
            'Send re-engagement emails to inactive members',
            'Create a community space for students to connect'
          ],
          confidence: 0.85,
          created_at: new Date().toISOString()
        }
      ]
    },
    
    dashboard: {
      totalStudents: 5,
      activeSubscriptions: 5,
      totalRevenue: 199.98,
      engagementRate: 0.75,
      avgSessionTime: '12:34',
      conversionRate: 0.65
    },
    
    charts: {
      revenue: [
        { date: '2025-10-11', amount: 49.99 },
        { date: '2025-10-12', amount: 29.99 },
        { date: '2025-10-13', amount: 0 },
        { date: '2025-10-14', amount: 19.99 },
        { date: '2025-10-15', amount: 39.99 },
        { date: '2025-10-16', amount: 59.99 },
        { date: '2025-10-17', amount: 79.99 }
      ],
      activity: [
        { date: '2025-10-11', events: 12 },
        { date: '2025-10-12', events: 8 },
        { date: '2025-10-13', events: 15 },
        { date: '2025-10-14', events: 6 },
        { date: '2025-10-15', events: 18 },
        { date: '2025-10-16', events: 22 },
        { date: '2025-10-17', events: 14 }
      ]
    },
    
    timestamp: new Date().toISOString(),
    version: 'mock-data-v1'
  };

  return NextResponse.json(mockData);
}

// Also support POST for consistency
export async function POST(request: NextRequest) {
  return GET(request);
}
