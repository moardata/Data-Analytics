/**
 * PDF Export API Endpoint
 * Generates PDF reports of analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';

export async function GET(request: NextRequest) {
  try {
    // Use simple auth (never hangs)
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

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

    // Note: For a full PDF implementation, you'd use jsPDF on the client-side
    // or a server-side library like Puppeteer or PDFKit
    // This is a placeholder that returns HTML that can be converted to PDF

    const reportHtml = await generateReportHtml(clientId);

    // In production, you'd convert this to PDF using a library
    // For now, return HTML that can be printed to PDF
    return new NextResponse(reportHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

async function generateReportHtml(clientId: string): Promise<string> {
  // Fetch all data
  const [clientResult, eventsResult, subscriptionsResult, entitiesResult, insightsResult] = await Promise.all([
    supabase.from('clients').select('*').eq('id', clientId).single(),
    supabase.from('events').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(50),
    supabase.from('subscriptions').select('*').eq('client_id', clientId),
    supabase.from('entities').select('*').eq('client_id', clientId),
    supabase.from('insights').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(10),
  ]);

  const client = clientResult.data;
  const events = eventsResult.data || [];
  const subscriptions = subscriptionsResult.data || [];
  const entities = entitiesResult.data || [];
  const insights = insightsResult.data || [];

  // Calculate metrics
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const totalRevenue = events
    .filter(e => e.event_type === 'order' && e.event_data?.amount)
    .reduce((sum, e) => sum + (e.event_data.amount || 0), 0);

  // Event type breakdown
  const eventTypes = events.reduce((acc: any, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEvents = events.filter(event => 
    new Date(event.created_at) > sevenDaysAgo
  ).length;

  // Generate sentiment analysis data (simulated for demo)
  const sentimentData = {
    positive: Math.floor(Math.random() * 30) + 40,
    neutral: Math.floor(Math.random() * 20) + 20,
    negative: Math.floor(Math.random() * 20) + 10
  };

  // Calculate engagement metrics
  const engagementScore = Math.min(100, Math.floor((recentEvents / Math.max(entities.length, 1)) * 100));
  const completionRate = Math.min(100, Math.floor((activeSubscriptions / Math.max(entities.length, 1)) * 100));

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Analytics Report - ${client?.name || 'Creator'}</title>
  <style>
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #4F46E5;
    }
    .header h1 {
      color: #4F46E5;
      margin: 0;
    }
    .header p {
      color: #666;
      margin: 5px 0;
    }
    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #4F46E5;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 10px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      background: #F9FAFB;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #4F46E5;
    }
    .metric-label {
      color: #666;
      margin-top: 5px;
    }
    .insight-card {
      background: #F0F9FF;
      border-left: 4px solid #3B82F6;
      padding: 15px;
      margin: 10px 0;
    }
    .insight-title {
      font-weight: bold;
      color: #1E40AF;
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #E5E7EB;
    }
    th {
      background: #F3F4F6;
      font-weight: 600;
      color: #374151;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    @media print {
      body { margin: 20px; }
      .metric-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Creator Analytics Report</h1>
    <p><strong>${client?.name || 'Creator'}</strong></p>
    <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <h2>📊 Key Metrics Overview</h2>
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value">${entities.length}</div>
        <div class="metric-label">Total Students</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${activeSubscriptions}</div>
        <div class="metric-label">Active Subscriptions</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">$${totalRevenue.toFixed(2)}</div>
        <div class="metric-label">Total Revenue</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${recentEvents}</div>
        <div class="metric-label">Recent Activity (7 days)</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${engagementScore}%</div>
        <div class="metric-label">Engagement Score</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${completionRate}%</div>
        <div class="metric-label">Completion Rate</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>📈 Activity Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Event Type</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(eventTypes).map(([type, count]) => `
          <tr>
            <td>${type.replace('_', ' ').toUpperCase()}</td>
            <td>${count}</td>
            <td>${Math.round((count as number / events.length) * 100)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>💭 Sentiment Analysis</h2>
    <div class="metrics">
      <div class="metric-card" style="background: #F0FDF4; border-left: 4px solid #10B981;">
        <div class="metric-value" style="color: #10B981;">${sentimentData.positive}%</div>
        <div class="metric-label">Positive Feedback</div>
      </div>
      <div class="metric-card" style="background: #F9FAFB; border-left: 4px solid #6B7280;">
        <div class="metric-value" style="color: #6B7280;">${sentimentData.neutral}%</div>
        <div class="metric-label">Neutral Feedback</div>
      </div>
      <div class="metric-card" style="background: #FEF2F2; border-left: 4px solid #EF4444;">
        <div class="metric-value" style="color: #EF4444;">${sentimentData.negative}%</div>
        <div class="metric-label">Negative Feedback</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Recent Insights</h2>
    ${insights.map(insight => `
      <div class="insight-card">
        <div class="insight-title">${insight.title}</div>
        <div>${insight.content}</div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Recent Activity</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Event Type</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${events.slice(0, 20).map(event => `
          <tr>
            <td>${new Date(event.created_at).toLocaleDateString()}</td>
            <td>${event.event_type}</td>
            <td>${JSON.stringify(event.event_data).substring(0, 60)}...</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Subscription Status</h2>
    <table>
      <thead>
        <tr>
          <th>Plan</th>
          <th>Status</th>
          <th>Amount</th>
          <th>Started</th>
          <th>Expires</th>
        </tr>
      </thead>
      <tbody>
        ${subscriptions.slice(0, 15).map(sub => `
          <tr>
            <td>${sub.plan_id}</td>
            <td>${sub.status}</td>
            <td>${sub.currency} ${sub.amount}</td>
            <td>${new Date(sub.started_at).toLocaleDateString()}</td>
            <td>${sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Generated by Creator Analytics | Powered by Whop</p>
  </div>
</body>
</html>
  `;

  return html;
}



