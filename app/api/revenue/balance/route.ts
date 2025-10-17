/**
 * Company Balance API
 * Uses company:balance:read permission to fetch real-time balance data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyId } from '@/lib/auth/whop-auth';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const whopApiKey = process.env.WHOP_API_KEY;
    
    // Fetch company balance from Whop API
    const balanceResponse = await fetch(`https://api.whop.com/api/v5/companies/${companyId}/balance`, {
      headers: {
        'Authorization': `Bearer ${whopApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!balanceResponse.ok) {
      throw new Error(`Whop API error: ${balanceResponse.statusText}`);
    }

    const balanceData = await balanceResponse.json();

    // Fetch transaction logs for detailed breakdown
    const logsResponse = await fetch(`https://api.whop.com/api/v5/companies/${companyId}/logs?limit=100`, {
      headers: {
        'Authorization': `Bearer ${whopApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    let logs = [];
    if (logsResponse.ok) {
      const logsData = await logsResponse.json();
      logs = logsData.data || [];
    }

    // Calculate revenue metrics
    const payments = logs.filter((log: any) => log.type === 'payment' || log.type === 'payment.succeeded');
    const refunds = logs.filter((log: any) => log.type === 'refund' || log.type === 'payment.refunded');
    const disputes = logs.filter((log: any) => log.type === 'dispute' || log.type === 'payment.disputed');

    const totalPayments = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const totalRefunds = refunds.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
    const totalDisputes = disputes.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

    const netRevenue = totalPayments - totalRefunds - totalDisputes;

    return NextResponse.json({
      balance: balanceData,
      metrics: {
        totalPayments,
        totalRefunds,
        totalDisputes,
        netRevenue,
        paymentCount: payments.length,
        refundCount: refunds.length,
        disputeCount: disputes.length,
        refundRate: payments.length > 0 ? (refunds.length / payments.length) * 100 : 0,
        disputeRate: payments.length > 0 ? (disputes.length / payments.length) * 100 : 0,
      },
      recentLogs: logs.slice(0, 20),
    });

  } catch (error: any) {
    console.error('Error fetching company balance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch company balance' },
      { status: 500 }
    );
  }
}

