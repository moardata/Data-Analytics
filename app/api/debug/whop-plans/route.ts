/**
 * Debug endpoint to fetch plan information from Whop API
 * Shows all plans for your product
 */

import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are not available in production' },
      { status: 404 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching memberships for company:', companyId);

    // Fetch all memberships for this company
    const membershipsResult = await whopSdk.client.memberships.list({
      company_id: companyId,
    });

    const allMemberships = membershipsResult.data || [];

    console.log('📊 Total memberships found:', allMemberships.length);

    // Extract plan information from memberships
    const planInfo = allMemberships.map((m: any) => ({
      membership_id: m.id,
      status: m.status,
      created_at: m.created_at,
      product: {
        id: m.product?.id,
        title: m.product?.title,
      },
      plan: {
        id: m.plan?.id,
        // Whop doesn't always return plan name in membership, but we can see the ID
      },
    }));

    return NextResponse.json({
      success: true,
      company_id: companyId,
      total_memberships: allMemberships.length,
      memberships: planInfo,
      raw_first_membership: allMemberships[0] || null, // Show full structure for debugging
    });

  } catch (error: any) {
    console.error('❌ Error fetching Whop plans:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch plans',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

