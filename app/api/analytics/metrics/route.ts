/**
 * Analytics Metrics API Endpoint
 * Calculates and returns dashboard metrics and chart data
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { format, subDays } from 'date-fns';
import { getCompanyId } from '@/lib/auth/whop-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || searchParams.get('clientId');
    const timeRange = searchParams.get('timeRange') || 'week';

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400 }
      );
    }

    // Calculate date range
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const startDate = subDays(new Date(), days).toISOString();

    // First, get the client record for this company
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!clientData) {
      console.log('No client found for companyId:', companyId);
      return NextResponse.json(
        { error: 'Client not found - needs initialization' },
        { status: 404 }
      );
    }

    const clientId = clientData.id;

    // Fetch all data in parallel using the client_id
    const [eventsResult, subscriptionsResult, entitiesResult, coursesResult, enrollmentsResult] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .eq('client_id', clientId)
        .gte('created_at', startDate),
      
      supabase
        .from('subscriptions')
        .select('*')
        .eq('client_id', clientId),
      
      supabase
        .from('entities')
        .select('*')
        .eq('client_id', clientId),
      
      supabase
        .from('courses')
        .select('*')
        .eq('client_id', clientId),
      
      supabase
        .from('course_enrollments')
        .select('*, lesson_interactions:lesson_interactions(is_completed)')
        .eq('client_id', clientId),
    ]);

    const events = eventsResult.data || [];
    const subscriptions = subscriptionsResult.data || [];
    const entities = entitiesResult.data || [];
    const courses = coursesResult.data || [];
    const enrollments = enrollmentsResult.data || [];

    // Calculate metrics
    const metrics = calculateMetrics(events, subscriptions, entities, courses, enrollments, days);

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

function calculateMetrics(events: any[], subscriptions: any[], entities: any[], courses: any[], enrollments: any[], days: number) {
  // Basic counts
  const totalStudents = entities.length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  // Course metrics
  const totalCourses = courses.length;
  const totalEnrollments = enrollments.length;
  const averageEnrollmentsPerCourse = courses.length > 0 ? enrollments.length / courses.length : 0;
  
  // Calculate completion rate
  const completedEnrollments = enrollments.filter((e: any) => e.completed_at).length;
  const courseCompletionRate = enrollments.length > 0 ? (completedEnrollments / enrollments.length) * 100 : 0;
  
  // Average course progress
  const averageCourseProgress = enrollments.length > 0
    ? enrollments.reduce((sum: number, e: any) => sum + (e.progress_percentage || 0), 0) / enrollments.length
    : 0;

  // Revenue calculation (including refunds and disputes)
  const orderEvents = events.filter(e => e.event_type === 'order' || e.event_type === 'payment_succeeded');
  const refundEvents = events.filter(e => e.event_type === 'payment_refunded');
  const disputeEvents = events.filter(e => e.event_type === 'payment_disputed');
  
  const grossRevenue = orderEvents.reduce((sum, e) => sum + (e.event_data?.amount || 0), 0);
  const refundedAmount = refundEvents.reduce((sum, e) => sum + (e.event_data?.amount || 0), 0);
  const disputedAmount = disputeEvents.reduce((sum, e) => sum + (e.event_data?.amount || 0), 0);
  const totalRevenue = grossRevenue - refundedAmount - disputedAmount;

  // Engagement calculation
  const activityEvents = events.filter(e => e.event_type === 'activity');
  const engagementRate = totalStudents > 0 ? (activityEvents.length / totalStudents) * 100 : 0;

  // Completion rate (from metadata)
  const studentsWithProgress = entities.filter(e => e.metadata?.progress);
  const avgProgress = studentsWithProgress.length > 0
    ? studentsWithProgress.reduce((sum, e) => sum + (e.metadata.progress || 0), 0) / studentsWithProgress.length
    : 0;

  // New students this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = entities.filter(e => new Date(e.created_at) > weekAgo).length;

  // Calculate changes (compare to previous period)
  const previousPeriodStart = new Date(Date.now() - (days * 2) * 24 * 60 * 60 * 1000);
  const previousPeriodEnd = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const previousStudents = entities.filter(e => 
    new Date(e.created_at) >= previousPeriodStart && 
    new Date(e.created_at) <= previousPeriodEnd
  ).length;
  
  const previousRevenue = orderEvents.filter(e => 
    new Date(e.created_at) >= previousPeriodStart && 
    new Date(e.created_at) <= previousPeriodEnd
  ).reduce((sum, e) => sum + (e.event_data?.amount || 0), 0);
  
  const studentsChange = previousStudents > 0 ? ((newThisWeek - previousStudents) / previousStudents) * 100 : 0;
  const subscriptionsChange = 0; // Would need previous period data
  const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const engagementChange = 0; // Would need previous period data
  const completionChange = 0; // Would need previous period data

  // Revenue over time chart data
  const revenueData = generateTimeSeriesData(orderEvents, days, 'amount');

  // Engagement over time chart data
  const engagementData = generateTimeSeriesData(activityEvents, days, 'count');

  // Subscription status pie chart data
  const subscriptionData = [
    { name: 'Active', value: subscriptions.filter(s => s.status === 'active').length },
    { name: 'Cancelled', value: subscriptions.filter(s => s.status === 'cancelled').length },
    { name: 'Expired', value: subscriptions.filter(s => s.status === 'expired').length },
    { name: 'Trialing', value: subscriptions.filter(s => s.status === 'trialing').length },
  ].filter(item => item.value > 0);

  // Student progress bar chart data
  const progressData = generateProgressData(entities);

  return {
    totalStudents,
    activeSubscriptions,
    totalRevenue,
    grossRevenue,
    refundedAmount,
    disputedAmount,
    netRevenue: totalRevenue,
    refundCount: refundEvents.length,
    disputeCount: disputeEvents.length,
    engagementRate,
    completionRate: avgProgress,
    newThisWeek,
    studentsChange,
    subscriptionsChange,
    revenueChange,
    engagementChange,
    completionChange,
    revenueData,
    engagementData,
    subscriptionData,
    progressData,
    // Course metrics
    totalCourses,
    totalEnrollments,
    averageEnrollmentsPerCourse,
    courseCompletionRate,
    averageCourseProgress,
    completedCourses: completedEnrollments,
    activeCourseEnrollments: enrollments.length - completedEnrollments,
  };
}

function generateTimeSeriesData(events: any[], days: number, metric: 'amount' | 'count') {
  const data: Record<string, number> = {};

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), days - i - 1), 'MMM dd');
    data[date] = 0;
  }

  // Aggregate events by day
  events.forEach(event => {
    const date = format(new Date(event.created_at), 'MMM dd');
    if (data[date] !== undefined) {
      if (metric === 'amount') {
        data[date] += event.event_data?.amount || 0;
      } else {
        data[date] += 1;
      }
    }
  });

  return Object.entries(data).map(([date, value]) => ({
    date,
    [metric]: metric === 'amount' ? Math.round(value * 100) / 100 : value,
  }));
}

function generateProgressData(entities: any[]) {
  // Group students by course from metadata
  const courseMap = new Map<string, number[]>();

  entities.forEach(entity => {
    const course = entity.metadata?.course || 'Unknown';
    const progress = entity.metadata?.progress || 0;
    
    if (!courseMap.has(course)) {
      courseMap.set(course, []);
    }
    courseMap.get(course)?.push(progress);
  });

  // Calculate average progress per course
  return Array.from(courseMap.entries()).map(([course, progressArray]) => ({
    course,
    progress: Math.round(progressArray.reduce((sum, p) => sum + p, 0) / progressArray.length),
    students: progressArray.length,
  }));
}



