/**
 * Experience Analytics API
 * Fetches analytics data using @whop/sdk
 * 
 * INCLUDES: Dispute rate tracking (critical for creators!)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { whopSdk } from '@/lib/whop-sdk';
import whopClient from '@/lib/whop-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ experienceId: string }> }
) {
  try {
    const { experienceId } = await params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Verify access
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!access.hasAccess || access.accessLevel === 'no_access') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get experience to extract company ID
    const experience = await whopClient.experiences.retrieve(experienceId);
    const companyId = experience.company.id;

    console.log('📊 Fetching analytics for company:', companyId);

    // Calculate date range
    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Fetch data using new SDK (parallel requests)
    const [
      paymentsIterator,
      membershipsIterator,
      membersIterator,
    ] = await Promise.all([
      whopClient.payments.list({ 
        company_id: companyId,
        created_after: cutoffDate.toISOString(),
      }),
      whopClient.memberships.list({ company_id: companyId }),
      whopClient.members.list({ company_id: companyId }),
    ]);

    // Convert iterators to arrays
    const payments = [];
    for await (const payment of paymentsIterator) {
      payments.push(payment);
    }

    const memberships = [];
    for await (const membership of membershipsIterator) {
      memberships.push(membership);
    }

    const members = [];
    for await (const member of membersIterator) {
      members.push(member);
    }

    // Calculate metrics
    const metrics = calculateAnalytics(payments, memberships, members, days);

    return NextResponse.json({
      success: true,
      companyId,
      experienceId,
      timeRange,
      ...metrics,
    });

  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch analytics'
    }, { status: 500 });
  }
}

function calculateAnalytics(payments: any[], memberships: any[], members: any[], days: number) {
  // Revenue Metrics
  const paidPayments = payments.filter(p => p.status === 'paid');
  const grossRevenue = paidPayments.reduce((sum, p) => sum + (p.total || 0), 0);
  const netRevenue = paidPayments.reduce((sum, p) => sum + (p.amount_after_fees || 0), 0);
  const refundedAmount = payments.reduce((sum, p) => sum + (p.refunded_amount || 0), 0);

  // CRITICAL: Dispute Rate (keeps financing access!)
  const disputeWarnings = payments.filter(p => p.dispute_alerted_at).length;
  const openDisputes = payments.filter(p => p.substatus === 'open_dispute').length;
  const totalDisputes = disputeWarnings + openDisputes;
  const disputeRate = payments.length > 0 ? (totalDisputes / payments.length) * 100 : 0;
  
  // Dispute Health Status
  let disputeStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (disputeRate >= 2.0) disputeStatus = 'critical'; // Lose all financing
  else if (disputeRate >= 1.0) disputeStatus = 'warning'; // Lose Klarna

  // Member Metrics
  const activeMembers = members.filter(m => m.status === 'joined').length;
  const totalMembers = members.length;
  
  // Churn Analysis
  const aboutToChurn = memberships.filter(m => m.cancel_at_period_end).length;
  const pastDue = memberships.filter(m => m.status === 'past_due').length;
  const canceledMemberships = memberships.filter(m => m.status === 'canceled');
  const churnRate = memberships.length > 0 ? (canceledMemberships.length / memberships.length) * 100 : 0;
  
  // Cancellation Reasons
  const cancellationReasons = canceledMemberships
    .map(m => m.cancellation_reason)
    .filter(Boolean);

  // Subscription Status
  const activeSubscriptions = memberships.filter(m => m.status === 'active').length;
  const trialingSubscriptions = memberships.filter(m => m.status === 'trialing').length;

  // Trial Conversion
  const trialConversionRate = trialingSubscriptions > 0 
    ? (activeSubscriptions / (activeSubscriptions + trialingSubscriptions)) * 100 
    : 0;

  // Customer Lifetime Value
  const avgLTV = members.length > 0
    ? members.reduce((sum, m) => sum + (m.usd_total_spent || 0), 0) / members.length
    : 0;

  // Failed Payments
  const failedPayments = payments.filter(p => p.substatus === 'failed').length;
  const failedPaymentRate = payments.length > 0 ? (failedPayments / payments.length) * 100 : 0;

  // Auto Refunds
  const autoRefunds = payments.filter(p => p.auto_refunded).length;
  const autoRefundRate = payments.length > 0 ? (autoRefunds / payments.length) * 100 : 0;

  return {
    // Revenue
    grossRevenue,
    netRevenue,
    refundedAmount,
    totalPayments: payments.length,
    
    // CRITICAL: Dispute Metrics
    disputeRate,
    disputeStatus,
    disputeWarnings,
    openDisputes,
    totalDisputes,
    
    // Members
    totalMembers,
    activeMembers,
    
    // Subscriptions
    activeSubscriptions,
    trialingSubscriptions,
    
    // Churn
    churnRate,
    aboutToChurn,
    pastDue,
    cancellationReasons,
    
    // Health
    failedPaymentRate,
    autoRefundRate,
    trialConversionRate,
    avgLTV,
    
    // Time period
    days,
  };
}

