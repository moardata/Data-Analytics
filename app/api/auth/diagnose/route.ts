/**
 * Authentication Diagnostic Endpoint
 * Helps debug why owner recognition is failing
 * 
 * PROTECTED: Only available in development mode
 */

import { NextRequest, NextResponse } from 'next/server';
import whopClient from '@/lib/whop-client';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are not available in production' },
      { status: 404 }
    );
  }
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
  };

  try {
    // 1. Check headers
    const userToken = request.headers.get('x-whop-user-token');
    diagnostics.checks.hasUserToken = !!userToken;
    diagnostics.checks.userTokenLength = userToken?.length || 0;

    // 2. Check URL parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    diagnostics.checks.companyId = companyId || 'MISSING';

    // 3. Check Whop client configuration
    diagnostics.checks.whopClientConfigured = !!whopClient;
    diagnostics.checks.appId = process.env.NEXT_PUBLIC_WHOP_APP_ID ? 'SET' : 'MISSING';
    diagnostics.checks.apiKey = process.env.WHOP_API_KEY ? 'SET' : 'MISSING';

    // 4. Try to decode JWT if available
    if (userToken) {
      try {
        const tokenParts = userToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          diagnostics.jwt = {
            valid: true,
            fields: Object.keys(payload),
            hasUserId: !!(payload.sub || payload.user_id || payload.userId || payload.id),
            exp: payload.exp,
            iat: payload.iat,
          };
          
          // Check if token is expired
          if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            diagnostics.jwt.expired = payload.exp < now;
            diagnostics.jwt.expiresIn = payload.exp - now;
          }
        } else {
          diagnostics.jwt = { valid: false, error: 'Invalid structure' };
        }
      } catch (error: any) {
        diagnostics.jwt = { valid: false, error: error.message };
      }
    } else {
      diagnostics.jwt = { valid: false, error: 'No token provided' };
    }

    // 5. Try checkAccess if we have everything
    if (userToken && companyId && whopClient) {
      try {
        const tokenParts = userToken.split('.');
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        const userId = payload.sub || payload.user_id || payload.userId || payload.id;
        
        if (userId) {
          try {
            const accessCheck = await whopClient.users.checkAccess(companyId, {
              id: userId,
            });
            
            diagnostics.accessCheck = {
              success: true,
              accessLevel: accessCheck.access_level,
              hasAccess: accessCheck.has_access,
              isOwner: accessCheck.access_level === 'admin',
            };
          } catch (error: any) {
            diagnostics.accessCheck = {
              success: false,
              error: error.message,
              type: typeof error,
              code: error.code,
              statusCode: error.statusCode,
            };
          }
        } else {
          diagnostics.accessCheck = {
            success: false,
            error: 'No user ID in JWT',
          };
        }
      } catch (error: any) {
        diagnostics.accessCheck = {
          success: false,
          error: 'Failed to decode token for access check',
        };
      }
    } else {
      diagnostics.accessCheck = {
        success: false,
        error: 'Missing required parameters',
        missing: {
          userToken: !userToken,
          companyId: !companyId,
          whopClient: !whopClient,
        },
      };
    }

    return NextResponse.json(diagnostics);
  } catch (error: any) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error.message,
      diagnostics,
    }, { status: 500 });
  }
}

