/**
 * Simple Role Check API
 * Determines if current user is owner or student/member
 * 
 * KEY INSIGHT:
 * - Students/Members: Have a valid MEMBERSHIP to the company
 * - Owners: Do NOT have a membership - they own the company
 */

import { NextRequest, NextResponse } from 'next/server';
import { simpleAuth } from '@/lib/auth/simple-auth';
import whopClient from '@/lib/whop-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Company ID required',
        isOwner: false,
        role: 'none'
      }, { status: 400 });
    }

    // Get auth info
    const auth = await simpleAuth(request);
    
    console.log('🔐 [Role Check] Starting check:', { userId: auth.userId, companyId });
    
    let isOwner = false;
    let role = 'student';

    // If test mode (no Whop headers), grant owner access
    if (auth.isTestMode) {
      console.log('🧪 [Role Check] Test mode - granting owner access');
      isOwner = true;
      role = 'owner';
    } else {
      // Real Whop auth - check if user has a membership
      try {
        console.log('🔍 [Role Check] Checking for memberships...');
        
        // Try to get user's memberships
        const membershipsIterator = await whopClient.memberships.list({
          user_id: auth.userId,
        });
        
        const memberships = [];
        for await (const membership of membershipsIterator) {
          memberships.push(membership);
          console.log('📋 [Role Check] Found membership:', {
            id: membership.id,
            status: membership.status,
            planId: membership.plan_id,
          });
        }
        
        console.log(`📊 [Role Check] Total memberships found: ${memberships.length}`);
        
        // KEY LOGIC:
        // - If user has ANY valid membership → They're a student/member (BLOCK)
        // - If user has NO memberships → They're the owner (ALLOW)
        
        if (memberships.length > 0) {
          console.log('❌ [Role Check] User has memberships - they are a STUDENT (blocked)');
          isOwner = false;
          role = 'student';
        } else {
          console.log('✅ [Role Check] User has NO memberships - they are the OWNER (allowed)');
          isOwner = true;
          role = 'owner';
        }
        
      } catch (membershipError: any) {
        console.error('⚠️ [Role Check] Membership check failed:', membershipError);
        
        // If we can't check memberships, fall back to the SDK's role check
        if (auth.isOwner) {
          console.log('✅ [Role Check] Fallback - SDK says owner');
          isOwner = true;
          role = 'owner';
        } else {
          console.log('❌ [Role Check] Fallback - assuming student (safe default)');
          isOwner = false;
          role = 'student';
        }
      }
    }

    console.log('🔐 [Role Check] Final result:', {
      userId: auth.userId,
      companyId: auth.companyId,
      isOwner,
      role,
      isTestMode: auth.isTestMode
    });

    return NextResponse.json({
      success: true,
      isOwner,
      role,
      userId: auth.userId,
      companyId: auth.companyId,
      isTestMode: auth.isTestMode
    });

  } catch (error: any) {
    console.error('❌ [Role Check] Error:', error);
    
    // On error, assume student (block access for safety)
    return NextResponse.json({
      success: false,
      error: error.message,
      isOwner: false,
      role: 'student'
    }, { status: 500 });
  }
}
