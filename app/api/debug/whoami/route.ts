/**
 * Debug Route for Access Testing
 * Helps reviewers verify access detection and user roles
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { whopSdk } from "@/lib/whop-sdk";

export async function GET(request: Request) {
  try {
    const h = await headers();
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    
    // Verify user token from headers
    const { userId } = await whopSdk.verifyUserToken(h);
    
    // If companyId provided, check company access
    if (companyId) {
      const access = await whopSdk.access.checkIfUserHasAccessToCompany({
        userId,
        companyId,
      });
      
      return NextResponse.json({
        ok: true,
        userId,
        companyId,
        access: {
          hasAccess: access.hasAccess,
          accessLevel: access.accessLevel,
        },
      });
    }
    
    // Return just user info if no companyId
    return NextResponse.json({
      ok: true,
      userId,
      message: 'Add ?companyId=<id> to check company access',
    });
    
  } catch (error: any) {
    console.error('Debug whoami error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to verify user',
      },
      { status: 401 }
    );
  }
}

