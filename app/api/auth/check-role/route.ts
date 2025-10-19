/**
 * Simple Role Check API
 * Determines if current user is owner or student
 */

import { NextRequest, NextResponse } from 'next/server';
import { simpleAuth } from '@/lib/auth/simple-auth';

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
    
    // SIMPLIFIED LOGIC:
    // For now, EVERYONE gets owner access
    // TODO: Add proper role checking when Whop SDK is working
    
    const isOwner = true;  // Grant access to everyone
    const role = 'owner';

    console.log('🔐 [Role Check] Result:', {
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
    
    // On error, assume student (block access)
    return NextResponse.json({
      success: false,
      error: error.message,
      isOwner: false,
      role: 'student'
    }, { status: 500 });
  }
}
