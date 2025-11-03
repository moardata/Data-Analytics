/**
 * Debug: Show User's Memberships
 * Helps identify which company a subscription is tied to
 */

import { NextRequest, NextResponse } from 'next/server';
import whopClient from '@/lib/whop-client';

export async function GET(request: NextRequest) {
  try {
    // Get user token from headers
    const userToken = request.headers.get('x-whop-user-token');
    
    if (!userToken) {
      return NextResponse.json({
        error: 'No user token found',
        suggestion: 'Access this endpoint through the Whop iframe'
      }, { status: 401 });
    }

    // Decode JWT to get user ID
    const tokenParts = userToken.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const userId = payload.sub || payload.user_id || payload.userId || payload.id;

    console.log('🔍 [Debug Memberships] Checking memberships for user:', userId);

    // Get the company ID from query params
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({
        error: 'companyId required',
        usage: 'Call with ?companyId=biz_XXX'
      }, { status: 400 });
    }

    // Try to fetch memberships for this company
    try {
      // Get all memberships for this company
      const membershipsResult = await whopClient.memberships.list({
        company_id: companyId,
      });

      const memberships = membershipsResult.data || [];
      
      console.log(`📊 [Debug Memberships] Found ${memberships.length} memberships for company ${companyId}`);
      
      // Filter to find this user's membership
      const userMembership = memberships.find((m: any) => 
        m.user?.id === userId || m.user_id === userId
      );
      
      // Format all memberships
      const formattedMemberships = memberships.map((m: any) => ({
        id: m.id,
        user_id: m.user?.id || m.user_id,
        is_you: (m.user?.id === userId || m.user_id === userId),
        status: m.status,
        plan_id: m.plan?.id || m.plan_id,
        plan_name: m.plan?.name || 'Unknown',
        created_at: m.created_at,
        expires_at: m.expires_at,
      }));

      return NextResponse.json({
        userId,
        companyId,
        totalMemberships: memberships.length,
        yourMembership: userMembership ? {
          id: userMembership.id,
          status: userMembership.status,
          plan_id: userMembership.plan?.id || userMembership.plan_id,
          plan_name: userMembership.plan?.name || 'Unknown',
        } : null,
        allMemberships: formattedMemberships,
      });

    } catch (apiError: any) {
      console.error('❌ [Debug Memberships] API error:', apiError);
      
      return NextResponse.json({
        error: 'Failed to fetch memberships',
        details: apiError.message,
        userId,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ [Debug Memberships] Error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

