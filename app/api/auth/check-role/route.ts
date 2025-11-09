/**
 * Simple Role Check API
 * Determines if current user is owner or student/member
 * 
 * KEY INSIGHT:
 * - Students/Members: Have a valid MEMBERSHIP to the company
 * - Owners: Do NOT have a membership - they own the company
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/auth-helpers';
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
    const auth = await authenticateRequest(request);
    
    
    let isOwner = false;
    let role = 'student';

    // Use access level from auth
    // KEY LOGIC FROM WHOP:
    // - accessLevel 'owner' = Company owner (ALLOW)
    // - accessLevel 'admin' = Company admin (ALLOW) 
    // - accessLevel 'member' = Regular member/student (BLOCK)
    
    if (auth.accessLevel === 'owner' || auth.accessLevel === 'admin') {
      isOwner = true;
      role = 'owner';
    } else {
      isOwner = false;
      role = 'student';
    }

    return NextResponse.json({
      success: true,
      isOwner,
      role,
      userId: auth.userId,
      companyId: auth.companyId,
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
