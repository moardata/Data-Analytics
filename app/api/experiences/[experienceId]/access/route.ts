/**
 * Experience Access Check API
 * Verifies if user has access to this experience
 * 
 * Uses proper @whop/sdk patterns
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

    if (!experienceId) {
      return NextResponse.json({
        success: false,
        error: 'Experience ID required'
      }, { status: 400 });
    }

    // Verify user token
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        hasAccess: false,
        accessLevel: 'no_access'
      }, { status: 401 });
    }

    // Check access using new SDK
    const accessResponse = await whopClient.users.checkAccess(experienceId, {
      id: userId
    });

    // Get experience details to extract company ID
    const experience = await whopClient.experiences.retrieve(experienceId);
    const companyId = experience.company.id;

    return NextResponse.json({
      success: true,
      hasAccess: accessResponse.has_access,
      accessLevel: accessResponse.access_level,
      userId,
      experienceId,
      companyId,
    });

  } catch (error: any) {
    console.error('Error checking experience access:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Access check failed',
      hasAccess: false,
      accessLevel: 'no_access'
    }, { status: 500 });
  }
}

