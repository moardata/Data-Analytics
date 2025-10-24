/**
 * CSV Export API Endpoint
 * Exports analytics data as CSV files
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

export async function GET(request: NextRequest) {
  try {
    // Use simple auth (never hangs)
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'events';

    // First, get the client record for this company
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

    const clientId = clientData.id; // This is the actual UUID

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'events':
        csvContent = await exportEvents(clientId);
        filename = 'events_export.csv';
        break;
      
      case 'subscriptions':
        csvContent = await exportSubscriptions(clientId);
        filename = 'subscriptions_export.csv';
        break;
      
      case 'entities':
        csvContent = await exportEntities(clientId);
        filename = 'students_export.csv';
        break;
      
      case 'insights':
        csvContent = await exportInsights(clientId);
        filename = 'insights_export.csv';
        break;
      
      case 'surveys':
        csvContent = await exportSurveys(clientId);
        filename = 'surveys_export.csv';
        break;
      
      case 'survey_responses':
        csvContent = await exportSurveyResponses(clientId);
        filename = 'survey_responses_export.csv';
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        );
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

async function exportEvents(clientId: string): Promise<string> {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (!events || events.length === 0) {
    return 'No data available';
  }

  // CSV Header
  let csv = 'ID,Event Type,Created At,Whop Event ID,Event Data\n';

  // CSV Rows
  events.forEach(event => {
    const eventData = JSON.stringify(event.event_data).replace(/"/g, '""');
    csv += `"${event.id}","${event.event_type}","${event.created_at}","${event.whop_event_id || ''}","${eventData}"\n`;
  });

  return csv;
}

async function exportSubscriptions(clientId: string): Promise<string> {
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (!subscriptions || subscriptions.length === 0) {
    return 'No data available';
  }

  // CSV Header
  let csv = 'ID,Subscription ID,Plan ID,Status,Amount,Currency,Started At,Expires At\n';

  // CSV Rows
  subscriptions.forEach(sub => {
    csv += `"${sub.id}","${sub.whop_subscription_id}","${sub.plan_id}","${sub.status}","${sub.amount}","${sub.currency}","${sub.started_at}","${sub.expires_at || ''}"\n`;
  });

  return csv;
}

async function exportEntities(clientId: string): Promise<string> {
  const { data: entities } = await supabase
    .from('entities')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (!entities || entities.length === 0) {
    return 'No data available';
  }

  // CSV Header
  let csv = 'ID,Whop User ID,Email,Name,Created At,Metadata\n';

  // CSV Rows
  entities.forEach(entity => {
    const metadata = JSON.stringify(entity.metadata).replace(/"/g, '""');
    csv += `"${entity.id}","${entity.whop_user_id}","${entity.email || ''}","${entity.name || ''}","${entity.created_at}","${metadata}"\n`;
  });

  return csv;
}

async function exportInsights(clientId: string): Promise<string> {
  const { data: insights } = await supabase
    .from('insights')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (!insights || insights.length === 0) {
    return 'No data available';
  }

  // CSV Header
  let csv = 'ID,Type,Title,Content,Created At\n';

  // CSV Rows
  insights.forEach(insight => {
    const content = insight.content.replace(/"/g, '""');
    csv += `"${insight.id}","${insight.insight_type}","${insight.title}","${content}","${insight.created_at}"\n`;
  });

  return csv;
}

async function exportSurveys(clientId: string): Promise<string> {
  const { data: surveys } = await supabase
    .from('form_templates')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (!surveys || surveys.length === 0) {
    return '\uFEFFNo data available'; // UTF-8 BOM
  }

  // CSV Header with UTF-8 BOM
  let csv = '\uFEFF';
  csv += 'Survey ID,Survey Name,Description,Number of Questions,Active Status,Created Date,Last Updated,Question List\n';

  // CSV Rows
  surveys.forEach(survey => {
    const description = (survey.description || '').replace(/"/g, '""');
    const name = survey.name.replace(/"/g, '""');
    const numQuestions = Array.isArray(survey.fields) ? survey.fields.length : 0;
    const activeStatus = survey.is_active ? 'Active' : 'Inactive';
    
    // Format dates
    const createdDate = survey.created_at ? new Date(survey.created_at).toLocaleDateString('en-US') : '';
    const updatedDate = survey.updated_at ? new Date(survey.updated_at).toLocaleDateString('en-US') : '';
    
    // Create readable question list
    let questionList = '';
    if (Array.isArray(survey.fields)) {
      questionList = survey.fields
        .map((field: any, index: number) => `${index + 1}. ${field.label} (${field.type})${field.required ? ' *' : ''}`)
        .join('; ');
    }
    questionList = questionList.replace(/"/g, '""');
    
    csv += `"${survey.id}","${name}","${description}","${numQuestions}","${activeStatus}","${createdDate}","${updatedDate}","${questionList}"\n`;
  });

  return csv;
}

async function exportSurveyResponses(clientId: string): Promise<string> {
  const { data: responses } = await supabase
    .from('form_submissions')
    .select(`
      *,
      form_templates(name, fields),
      entities(name, email)
    `)
    .eq('client_id', clientId)
    .order('submitted_at', { ascending: false });

  if (!responses || responses.length === 0) {
    return '\uFEFFNo data available'; // UTF-8 BOM
  }

  // Collect all unique question labels across all forms
  const allQuestions = new Set<string>();
  responses.forEach(response => {
    if (response.responses && typeof response.responses === 'object') {
      Object.keys(response.responses).forEach(key => allQuestions.add(key));
    }
  });

  const questionColumns = Array.from(allQuestions).sort();

  // CSV Header with UTF-8 BOM for Excel compatibility
  let csv = '\uFEFF'; // UTF-8 BOM
  csv += 'Submission ID,Form Name,Student Name,Student Email,Submitted Date,Submitted Time';
  
  // Add question columns
  questionColumns.forEach(question => {
    csv += `,"${question.replace(/"/g, '""')}"`;
  });
  csv += '\n';

  // CSV Rows
  responses.forEach(response => {
    const formName = (response.form_templates?.name || 'Unknown Form').replace(/"/g, '""');
    const studentName = (response.entities?.name || 'Unknown Student').replace(/"/g, '""');
    const studentEmail = (response.entities?.email || '').replace(/"/g, '""');
    
    // Format date and time separately
    const submittedDate = response.submitted_at ? new Date(response.submitted_at) : null;
    const dateStr = submittedDate ? submittedDate.toLocaleDateString('en-US') : '';
    const timeStr = submittedDate ? submittedDate.toLocaleTimeString('en-US') : '';
    
    csv += `"${response.id}","${formName}","${studentName}","${studentEmail}","${dateStr}","${timeStr}"`;
    
    // Add response values for each question
    questionColumns.forEach(question => {
      const value = response.responses?.[question];
      let formattedValue = '';
      
      if (value !== null && value !== undefined) {
        if (typeof value === 'object') {
          formattedValue = JSON.stringify(value);
        } else {
          formattedValue = String(value);
        }
      }
      
      // Escape quotes and wrap in quotes
      formattedValue = formattedValue.replace(/"/g, '""');
      csv += `,"${formattedValue}"`;
    });
    
    csv += '\n';
  });

  return csv;
}


