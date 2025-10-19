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
      // Real Whop auth - use the access level from simpleAuth
      // simpleAuth already checks company ownership via SDK
      console.log('🔍 [Role Check] Using simpleAuth access level:', auth.accessLevel);
      
      // KEY LOGIC FROM WHOP:
      // - accessLevel 'owner' = Company owner (ALLOW)
      // - accessLevel 'admin' = Company admin (ALLOW) 
      // - accessLevel 'member' = Regular member/student (BLOCK)
      
      if (auth.accessLevel === 'owner' || auth.accessLevel === 'admin') {
        console.log('✅ [Role Check] User is owner/admin - ALLOWED');
        isOwner = true;
        role = 'owner';
      } else {
        console.log('❌ [Role Check] User is member/student - BLOCKED');
        isOwner = false;
        role = 'student';
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
