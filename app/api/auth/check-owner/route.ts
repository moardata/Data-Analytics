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
      // STRATEGY: Use Whop SDK to check memberships
      // Owners don't have memberships to their own company, students do
      try {
        console.log('🔍 [Check Owner] Checking memberships via Whop SDK...');
        
        let hasMembership = false;
        let isOwner = false;
        
        try {
          // Use Whop SDK to list memberships for this user
          const memberships = await whopClient.memberships.list({
            user_id: userId,
            company_id: companyId,
          });
          
          console.log('📊 [Check Owner] Memberships response:', memberships);
          
          // Check if response has data
          if (memberships && typeof memberships === 'object') {
            const membershipData = memberships as any;
            
            // Check various possible response formats
            if (Array.isArray(membershipData)) {
              hasMembership = membershipData.length > 0;
            } else if (Array.isArray(membershipData.data)) {
              hasMembership = membershipData.data.length > 0;
            } else if (membershipData.memberships && Array.isArray(membershipData.memberships)) {
              hasMembership = membershipData.memberships.length > 0;
            }
            
            console.log('🔍 [Check Owner] Has membership:', hasMembership);
          }
          
          // Inverse logic: If user has membership, they're a student (not owner)
          isOwner = !hasMembership;
          
          console.log(isOwner 
            ? '✅ [Check Owner] No memberships → User IS the owner' 
            : '❌ [Check Owner] Has memberships → User is a student'
          );
          
          return NextResponse.json({ 
            isOwner,
            userId: userId.substring(0, 10) + '...',
            companyId,
            method: 'sdk_membership_check',
            debug: {
              user_id: userId,
              has_membership: hasMembership,
            }
          });
          
        } catch (membershipError: any) {
          console.error('❌ [Check Owner] Membership check failed:', membershipError);
          console.error('❌ [Check Owner] Error details:', membershipError.message || membershipError);
          
          // IMPORTANT: Fail-closed for security
          // If we can't determine ownership, default to student
          return NextResponse.json({ 
            isOwner: false,
            userId: userId.substring(0, 10) + '...',
            companyId,
            method: 'membership_check_failed',
            temporary: true,
            error: 'Membership check failed - defaulting to student access',
            details: membershipError.message || String(membershipError)
          });
        }
        
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
