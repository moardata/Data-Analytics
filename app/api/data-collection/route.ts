/**
 * Enhanced Data Collection API
 * Centralized endpoint for collecting and processing all student data
 * Implements multi-tenant isolation and data cleaning for AI processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    // Get the client record for multi-tenant isolation
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, company_id, current_tier')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || 'week';
    const includeRaw = searchParams.get('includeRaw') === 'true';

    // Collect all data types with proper multi-tenant filtering
    const dataCollection = await collectAllData(clientId, timeRange, includeRaw);

    return NextResponse.json({
      success: true,
      clientId,
      companyId,
      timeRange,
      dataCollection,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in data collection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to collect data' },
      { status: 500 }
    );
  }
}

/**
 * Collects all relevant data for AI processing with multi-tenant isolation
 */
async function collectAllData(clientId: string, timeRange: string, includeRaw: boolean = false) {
  const daysAgo = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
  const startDate = new Date(Date.now() - daysAgo * 86400000).toISOString();

  console.log(`📊 [Data Collection] Collecting data for client ${clientId} (${timeRange})`);

  // 1. Survey Responses (Primary AI input)
  const { data: surveyResponses } = await supabase
    .from('form_submissions')
    .select(`
      id,
      responses,
      submitted_at,
      form_templates(name, description),
      entities(name, email)
    `)
    .eq('client_id', clientId)
    .gte('submitted_at', startDate)
    .order('submitted_at', { ascending: false });

  // 2. Engagement Logs (Activity tracking)
  const { data: engagementLogs } = await supabase
    .from('events')
    .select(`
      id,
      event_type,
      event_data,
      created_at,
      entities(name, email)
    `)
    .eq('client_id', clientId)
    .gte('created_at', startDate)
    .order('created_at', { ascending: false });

  // 3. Course Completion Data (Progress tracking)
  const { data: completionData } = await supabase
    .from('events')
    .select(`
      id,
      event_type,
      event_data,
      created_at,
      entities(name, email)
    `)
    .eq('client_id', clientId)
    .eq('event_type', 'activity')
    .gte('created_at', startDate)
    .order('created_at', { ascending: false });

  // 4. Student Entities (User profiles)
  const { data: students } = await supabase
    .from('entities')
    .select('id, name, email, whop_user_id, created_at, metadata')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  // 5. Form Templates (Survey definitions)
  const { data: formTemplates } = await supabase
    .from('form_templates')
    .select('id, name, description, fields, is_active, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  // Process and clean data for AI consumption
  const processedData = {
    // Clean survey responses for AI analysis
    surveyResponses: cleanSurveyResponses(surveyResponses || []),
    
    // Process engagement patterns
    engagementMetrics: processEngagementMetrics(engagementLogs || []),
    
    // Extract completion patterns
    completionPatterns: processCompletionData(completionData || []),
    
    // Student demographics and activity
    studentProfiles: processStudentProfiles(students || []),
    
    // Available surveys and their status
    availableSurveys: processFormTemplates(formTemplates || []),
    
    // Raw data (if requested for debugging)
    ...(includeRaw && {
      rawData: {
        surveyResponses: surveyResponses,
        engagementLogs: engagementLogs,
        completionData: completionData,
        students: students,
        formTemplates: formTemplates
      }
    })
  };

  // Calculate data quality metrics
  const dataQuality = calculateDataQuality(processedData);

  return {
    processedData,
    dataQuality,
    collectionStats: {
      totalSurveyResponses: surveyResponses?.length || 0,
      totalEngagementEvents: engagementLogs?.length || 0,
      totalStudents: students?.length || 0,
      activeSurveys: formTemplates?.filter(f => f.is_active).length || 0,
      timeRange: `${daysAgo} days`,
      dataFreshness: new Date().toISOString()
    }
  };
}

/**
 * Cleans and formats survey responses for AI processing
 */
function cleanSurveyResponses(responses: any[]) {
  return responses.map(response => {
    const cleanedResponses: Record<string, any> = {};
    
    // Clean each response field
    Object.entries(response.responses || {}).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim().length > 0) {
        // Basic PII scrubbing
        let cleanedValue = value
          .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
          .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
          .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]')
          .trim();
        
        cleanedResponses[key] = cleanedValue;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        cleanedResponses[key] = value;
      }
    });

    return {
      id: response.id,
      formName: response.form_templates?.name || 'Unknown Form',
      studentName: response.entities?.name || 'Anonymous',
      responses: cleanedResponses,
      submittedAt: response.submitted_at,
      responseCount: Object.keys(cleanedResponses).length
    };
  });
}

/**
 * Processes engagement metrics from event logs
 */
function processEngagementMetrics(events: any[]) {
  const engagementByType = events.reduce((acc, event) => {
    const type = event.event_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dailyActivity = events.reduce((acc, event) => {
    const date = new Date(event.created_at).toDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEvents: events.length,
    engagementByType,
    dailyActivity,
    mostActiveDay: Object.entries(dailyActivity).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0],
    averageDailyActivity: events.length / Object.keys(dailyActivity).length || 0
  };
}

/**
 * Processes course completion data
 */
function processCompletionData(events: any[]) {
  const completionEvents = events.filter(e => 
    e.event_data?.action === 'lesson_completed' || 
    e.event_data?.action === 'module_completed' ||
    e.event_data?.action === 'course_completed'
  );

  const completionRates = completionEvents.reduce((acc, event) => {
    const action = event.event_data?.action;
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalCompletions: completionEvents.length,
    completionRates,
    completionTrend: completionEvents.map(e => ({
      action: e.event_data?.action,
      timestamp: e.created_at,
      student: e.entities?.name || 'Unknown'
    }))
  };
}

/**
 * Processes student profiles for demographic analysis
 */
function processStudentProfiles(students: any[]) {
  return students.map(student => ({
    id: student.id,
    name: student.name || 'Anonymous',
    email: student.email ? '[EMAIL]' : null, // PII protection
    joinDate: student.created_at,
    hasMetadata: Object.keys(student.metadata || {}).length > 0
  }));
}

/**
 * Processes form templates for survey analysis
 */
function processFormTemplates(templates: any[]) {
  return templates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    isActive: template.is_active,
    fieldCount: template.fields?.length || 0,
    createdAt: template.created_at
  }));
}

/**
 * Calculates data quality metrics for AI processing
 */
function calculateDataQuality(data: any) {
  const totalResponses = data.surveyResponses.length;
  const totalEvents = data.engagementMetrics.totalEvents;
  const totalStudents = data.studentProfiles.length;
  
  return {
    dataVolume: {
      surveyResponses: totalResponses,
      engagementEvents: totalEvents,
      uniqueStudents: totalStudents,
      dataRichness: totalResponses > 10 ? 'high' : totalResponses > 5 ? 'medium' : 'low'
    },
    dataCompleteness: {
      hasSurveyData: totalResponses > 0,
      hasEngagementData: totalEvents > 0,
      hasStudentData: totalStudents > 0,
      overallCompleteness: totalResponses > 0 && totalEvents > 0 ? 'complete' : 'partial'
    },
    aiReadiness: {
      sufficientForAnalysis: totalResponses >= 3,
      recommendedForAI: totalResponses >= 5,
      dataQuality: totalResponses >= 10 ? 'excellent' : totalResponses >= 5 ? 'good' : 'needs_more_data'
    }
  };
}
