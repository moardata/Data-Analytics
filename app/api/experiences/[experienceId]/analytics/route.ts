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

    // For now, use the old analytics endpoint (already working)
    // TODO: Migrate to @whop/sdk once we understand the correct API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const analyticsResponse = await fetch(
      `${baseUrl}/api/analytics/metrics?companyId=${companyId}&timeRange=${timeRange === '7d' ? 'week' : timeRange === '90d' ? 'quarter' : 'month'}`,
      {
        headers: headersList
      }
    );

    if (!analyticsResponse.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const analyticsData = await analyticsResponse.json();
    
    // Return the analytics data
    return NextResponse.json({
      success: true,
      companyId,
      experienceId,
      timeRange,
      ...analyticsData,
    });

  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch analytics'
    }, { status: 500 });
  }
}

