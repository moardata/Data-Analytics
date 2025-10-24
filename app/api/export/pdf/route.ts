/**
 * PDF Export API Endpoint
 * Generates PDF reports of analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { simpleAuth } from '@/lib/auth/simple-auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(request: NextRequest) {
  try {
    // Use simple auth (never hangs)
    const auth = await simpleAuth(request);
    const companyId = auth.companyId;

    // First, get the client record for this company
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found for this company' },
        { status: 404 }
      );
    }

    const clientId = clientData.id;

    // Generate PDF
    const pdfData = await generatePDF(clientId, clientData.name || 'Creator');

    // Return PDF as downloadable file
    return new NextResponse(pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analytics_report_${new Date().toISOString().split('T')[0]}.pdf"`,
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

async function generatePDF(clientId: string, clientName: string): Promise<ArrayBuffer> {
  // Fetch all data
  const [eventsResult, subscriptionsResult, entitiesResult, insightsResult, formsResult, submissionsResult] = await Promise.all([
    supabase.from('events').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(50),
    supabase.from('subscriptions').select('*').eq('client_id', clientId),
    supabase.from('entities').select('*').eq('client_id', clientId),
    supabase.from('insights').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(10),
    supabase.from('form_templates').select('*').eq('client_id', clientId),
    supabase.from('form_submissions').select('*').eq('client_id', clientId),
  ]);

  const events = eventsResult.data || [];
  const subscriptions = subscriptionsResult.data || [];
  const entities = entitiesResult.data || [];
  const insights = insightsResult.data || [];
  const forms = formsResult.data || [];
  const submissions = submissionsResult.data || [];

  // Calculate metrics
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  
  // Calculate revenue from multiple sources
  // 1. From payment events
  const paymentEvents = events.filter(e => 
    e.event_type === 'payment.succeeded' || 
    e.event_type === 'order' || 
    e.event_type === 'payment_intent.succeeded' ||
    e.event_type === 'payment_succeeded'
  );
  
  const eventRevenue = paymentEvents.reduce((sum, e) => {
    const amount = e.event_data?.amount || 
                   e.event_data?.total || 
                   e.event_data?.value ||
                   e.metadata?.amount ||
                   0;
    return sum + amount;
  }, 0);
  
  // 2. From active subscriptions (they have amount stored)
  const subscriptionRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.amount || 0), 0);
  
  // Total revenue is the sum of both
  const totalRevenue = eventRevenue + subscriptionRevenue;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEvents = events.filter(event => new Date(event.created_at) > sevenDaysAgo).length;

  const engagementScore = Math.min(100, Math.floor((recentEvents / Math.max(entities.length, 1)) * 100));
  const completionRate = Math.min(100, Math.floor((activeSubscriptions / Math.max(entities.length, 1)) * 100));

  // Event type breakdown
  const eventTypes = events.reduce((acc: any, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  // Create PDF
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text('Creator Analytics Report', 105, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(clientName, 105, yPosition, { align: 'center' });
  yPosition += 7;

  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Key Metrics
  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.text('📊 Key Metrics Overview', 20, yPosition);
  yPosition += 10;

  // Metrics grid
  const metrics = [
    ['Total Students', String(entities.length)],
    ['Active Subscriptions', String(activeSubscriptions)],
    ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
    ['Recent Activity (7 days)', String(recentEvents)],
    ['Engagement Score', `${engagementScore}%`],
    ['Completion Rate', `${completionRate}%`],
    ['Total Forms', String(forms.length)],
    ['Total Responses', String(submissions.length)],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: metrics as any,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Activity Breakdown
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.text('📈 Activity Breakdown', 20, yPosition);
  yPosition += 10;

  const activityData = Object.entries(eventTypes).map(([type, count]) => [
    type.replace('_', ' ').toUpperCase(),
    String(count),
    `${Math.round((count as number / events.length) * 100)}%`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Event Type', 'Count', 'Percentage']],
    body: activityData as any,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Survey Analytics
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.text('📋 Survey Analytics', 20, yPosition);
  yPosition += 10;

  const surveyData = forms.map(form => [
    form.name,
    String(submissions.filter(s => s.form_id === form.id).length),
    form.is_active ? 'Active' : 'Inactive'
  ]);

  if (surveyData.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Survey Name', 'Responses', 'Status']],
      body: surveyData as any,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 20, right: 20 },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Recent Insights
  if (insights.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.text('💡 Recent Insights', 20, yPosition);
    yPosition += 10;

    insights.slice(0, 5).forEach((insight, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(30, 64, 175);
      doc.text(`${index + 1}. ${insight.title}`, 20, yPosition);
      yPosition += 7;

      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const contentLines = doc.splitTextToSize(insight.content, 170);
      doc.text(contentLines, 25, yPosition);
      yPosition += contentLines.length * 5 + 5;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Creator Analytics | Powered by Whop', 105, 285, { align: 'center' });

  // Return ArrayBuffer directly for NextResponse compatibility
  return doc.output('arraybuffer') as ArrayBuffer;
}
