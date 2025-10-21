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

    console.log('🔐 [Check Owner] Company ID:', companyId);
    
    // Get the Whop user token from headers
    const userToken = request.headers.get('x-whop-user-token');
    
    if (!userToken) {
      console.log('⚠️ [Check Owner] No x-whop-user-token header found');
      
      // TEMPORARY: Grant access when we can't determine user
      return NextResponse.json({ 
        isOwner: true,
        temporary: true,
        reason: 'No x-whop-user-token header - granting access'
      });
    }

    console.log('✅ [Check Owner] Found x-whop-user-token');

    // Decode the JWT to get user ID (JWT structure: header.payload.signature)
    try {
      const tokenParts = userToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT structure');
      }

      // Decode the payload (middle part)
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('🔍 [Check Owner] Token payload:', payload);
      
      // Get user ID from token (could be 'sub', 'user_id', 'userId', etc.)
      const userId = payload.sub || payload.user_id || payload.userId || payload.id;
      
      if (!userId) {
        console.log('⚠️ [Check Owner] No user ID in token payload');
        return NextResponse.json({ 
          isOwner: true,
          temporary: true,
          reason: 'No user ID in token',
          payload
        });
      }

      console.log('✅ [Check Owner] User ID from token:', userId);

      // OFFICIAL WHOP METHOD: Use users.checkAccess
      // Returns access_level: 'no_access' | 'admin' | 'customer'
      try {
        console.log('🔍 [Check Owner] Checking access level via Whop SDK...');
        
        const accessCheck = await whopClient.users.checkAccess(companyId, {
          id: userId,
        });
        
        console.log('📊 [Check Owner] Access check result:', accessCheck);
        
        const accessLevel = accessCheck.access_level || 'no_access';
        
        // Whop returns 'admin' for owners, 'customer' for students
        const isOwner = accessLevel === 'admin';
        
        console.log('🔍 [Check Owner] Access level:', accessLevel);
        console.log(isOwner 
          ? '✅ [Check Owner] User is ADMIN/OWNER' 
          : '❌ [Check Owner] User is CUSTOMER/STUDENT'
        );
        
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
        console.error('❌ [Check Owner] Error details:', accessError.message || accessError);
        
        // FAIL-CLOSED: Default to student if check fails
        return NextResponse.json({ 
          isOwner: false,
          userId: userId.substring(0, 10) + '...',
          companyId,
          method: 'access_check_failed',
          temporary: true,
          error: 'Access check failed - defaulting to student',
          details: accessError.message || String(accessError)
        });
      }

    } catch (decodeError: any) {
      console.error('❌ [Check Owner] JWT decode error:', decodeError.message);
      
      // If JWT decode fails, grant access (fail-open)
      return NextResponse.json({ 
        isOwner: true,
        temporary: true,
        error: 'JWT decode failed - granting access',
        details: decodeError.message
      });
    }

  } catch (error: any) {
    console.error('❌ [Check Owner] Error:', error);
    return NextResponse.json({ 
      isOwner: true, // Fail-open for now
      temporary: true,
      error: error.message 
    });
  }
}
