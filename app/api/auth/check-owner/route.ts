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

      // Now check if this user owns the company
      try {
        const company = await whopClient.companies.retrieve(companyId);
        const companyData = company as any;
        
        // Log FULL company data to see all fields
        console.log('📊 [Check Owner] FULL Company data:', JSON.stringify(companyData, null, 2));
        console.log('🔍 [Check Owner] User ID to match:', userId);
        console.log('🔍 [Check Owner] Company owner_id:', companyData.owner_id);
        console.log('🔍 [Check Owner] Company created_by:', companyData.created_by);
        console.log('🔍 [Check Owner] Company creator_id:', companyData.creator_id);
        
        // Check if user is the owner
        const isOwner = companyData.owner_id === userId || 
                       companyData.created_by === userId ||
                       companyData.creator_id === userId;
        
        console.log(isOwner ? '✅ [Check Owner] User IS the owner' : '❌ [Check Owner] User is NOT the owner');
        console.log('🔍 [Check Owner] Match results:', {
          owner_id_match: companyData.owner_id === userId,
          created_by_match: companyData.created_by === userId,
          creator_id_match: companyData.creator_id === userId,
        });
        
        return NextResponse.json({ 
          isOwner,
          userId: userId.substring(0, 10) + '...',
          companyId,
          method: 'jwt_decode_and_api',
          debug: {
            company_owner_id: companyData.owner_id,
            user_id: userId,
          }
        });
        
      } catch (apiError: any) {
        console.error('❌ [Check Owner] Whop API error:', apiError.message || apiError);
        
        // If API fails, grant access (fail-open)
        return NextResponse.json({ 
          isOwner: true,
          temporary: true,
          error: 'Whop API check failed - granting access',
          details: apiError.message
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
