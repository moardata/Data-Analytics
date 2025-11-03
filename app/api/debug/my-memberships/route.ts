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

    // Try to fetch user's memberships
    try {
      // Get all memberships for this user
      const membershipsResult = await whopClient.memberships.list({
        user_id: userId,
      });

      const memberships = membershipsResult.data || [];
      
      console.log(`📊 [Debug Memberships] Found ${memberships.length} memberships`);
      
      // Format the response
      const formattedMemberships = memberships.map((m: any) => ({
        id: m.id,
        status: m.status,
        valid: m.valid,
        plan_id: m.plan?.id || m.plan_id,
        plan_name: m.plan?.name || 'Unknown',
        company_id: m.company?.id || m.company_id,
        company_name: m.company?.name || 'Unknown',
        created_at: m.created_at,
        expires_at: m.expires_at,
        access_pass: m.access_pass,
      }));

      return NextResponse.json({
        userId,
        totalMemberships: memberships.length,
        memberships: formattedMemberships,
        raw: memberships, // Include raw data for debugging
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

