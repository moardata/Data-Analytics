/**
 * CSV Export API Endpoint
 * Exports analytics data as CSV files
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const type = searchParams.get('type') || 'events';

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

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


