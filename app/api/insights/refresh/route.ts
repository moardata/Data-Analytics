/**
 * Refresh Insights API
 * Refreshes insights for a client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyId } from '@/lib/auth/whop-auth';
import { generateInsightsForClient } from '@/lib/utils/aiInsights';

export async function POST(request: NextRequest) {
  try {
    const clientId = await getCompanyId(request);
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate new insights
    const insights = await generateInsightsForClient(clientId, 'week');
    
    return NextResponse.json({
      success: true,
      insights: insights.length,
      message: 'Insights refreshed successfully'
    });

  } catch (error: any) {
    console.error('Error refreshing insights:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh insights' },
      { status: 500 }
    );
  }
}
