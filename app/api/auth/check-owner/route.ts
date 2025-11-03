import { NextRequest, NextResponse } from 'next/server';
import whopClient from '@/lib/whop-client';

/**
 * Check if current user is the owner of a company
 * 
 * Uses the x-whop-user-token header that Whop provides
 * Decodes the JWT to get user ID, then checks ownership
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ 
        isOwner: false,
        error: 'No company ID provided'
      });
    }

    
    // Get the Whop user token from headers
    const userToken = request.headers.get('x-whop-user-token');
    
    if (!userToken) {
      // Production: Deny access without valid token
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ 
          isOwner: false,
          error: 'Authentication token required'
        }, { status: 401 });
      }
      
      // Development fallback
      return NextResponse.json({ 
        isOwner: true,
        development: true
      });
    }


    // Decode the JWT to get user ID (JWT structure: header.payload.signature)
    try {
      const tokenParts = userToken.split('.');
      if (tokenParts.length !== 3) {
        console.error('❌ [Check Owner] Invalid JWT structure - expected 3 parts, got:', tokenParts.length);
        throw new Error('Invalid JWT structure');
      }

      // Decode the payload (middle part)
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      console.log('🔍 [Check Owner] JWT Payload keys:', Object.keys(payload));
      console.log('🔍 [Check Owner] JWT Payload:', JSON.stringify(payload, null, 2));
      
      // Get user ID from token (could be 'sub', 'user_id', 'userId', etc.)
      const userId = payload.sub || payload.user_id || payload.userId || payload.id;
      
      console.log('👤 [Check Owner] Extracted User ID:', userId);
      console.log('🏢 [Check Owner] Company ID:', companyId);
      
      if (!userId) {
        console.warn('⚠️ [Check Owner] No user ID found in token - granting owner access');
        return NextResponse.json({ 
          isOwner: true,
          temporary: true,
          reason: 'No user ID in token',
          availableFields: Object.keys(payload)
        });
      }


      // OFFICIAL WHOP METHOD: Use users.checkAccess
      // Returns access_level: 'no_access' | 'admin' | 'customer'
      try {
        console.log('🔐 [Check Owner] Calling whopClient.users.checkAccess...');
        console.log('🔐 [Check Owner] Parameters:', { companyId, userId });
        
        const accessCheck = await whopClient.users.checkAccess(companyId, {
          id: userId,
        });
        
        console.log('✅ [Check Owner] Access check response:', JSON.stringify(accessCheck, null, 2));
        
        const accessLevel = accessCheck.access_level || 'no_access';
        
        // Whop returns 'admin' for owners, 'customer' for students
        const isOwner = accessLevel === 'admin';
        
        console.log(`🎯 [Check Owner] Result: ${isOwner ? 'OWNER' : 'STUDENT'} (access_level: ${accessLevel})`);
        
        return NextResponse.json({ 
          isOwner,
          userId: userId.substring(0, 10) + '...',
          companyId,
          method: 'whop_sdk_users_check_access',
          debug: {
            user_id: userId,
            access_level: accessLevel,
            has_access: accessCheck.has_access,
          }
        });
        
      } catch (accessError: any) {
        console.error('❌ [Check Owner] Access check failed:', accessError);
        console.error('❌ [Check Owner] Error type:', typeof accessError);
        console.error('❌ [Check Owner] Error stack:', accessError.stack);
        
        // Parse the error to see if it's a permissions issue
        const errorMessage = accessError.message || String(accessError);
        const errorDetails = JSON.stringify(accessError, null, 2);
        
        console.error('❌ [Check Owner] Error message:', errorMessage);
        console.error('❌ [Check Owner] Full error:', errorDetails);
        
        // SECURITY FIX: Default to DENY (student mode) if we can't verify ownership
        // Only grant access in development mode for easier testing
        const isDev = process.env.NODE_ENV === 'development';
        
        return NextResponse.json({ 
          isOwner: isDev,
          userId: userId.substring(0, 10) + '...',
          companyId,
          method: 'access_check_failed',
          temporary: true,
          error: 'Access check failed',
          details: errorMessage,
          devMode: isDev
        });
      }

    } catch (decodeError: any) {
      console.error('❌ [Check Owner] JWT decode error:', decodeError.message);
      
      // SECURITY FIX: Fail-closed on JWT decode errors
      const isDev = process.env.NODE_ENV === 'development';
      
      return NextResponse.json({ 
        isOwner: isDev,
        temporary: true,
        error: 'JWT decode failed',
        details: decodeError.message,
        devMode: isDev
      });
    }

  } catch (error: any) {
    console.error('❌ [Check Owner] Fatal error:', error);
    
    // SECURITY FIX: Fail-closed on fatal errors
    const isDev = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({ 
      isOwner: isDev,
      temporary: true,
      error: error.message,
      devMode: isDev
    });
  }
}
