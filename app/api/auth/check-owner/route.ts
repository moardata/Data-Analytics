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
      // STRATEGY: Owners don't have memberships, students do
      // Try to get user's memberships - if none, they're the owner
      try {
        console.log('🔍 [Check Owner] Checking memberships for user...');
        
        // Try to get memberships for this user in this company
        let hasMembership = false;
        let isOwner = false;
        
        try {
          // Use Whop API to check memberships
          const membershipsResponse = await fetch(
            `https://api.whop.com/api/v5/memberships?user_id=${userId}&company_id=${companyId}`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
                'Content-Type': 'application/json',
              }
            }
          );
          
          if (membershipsResponse.ok) {
            const membershipsData = await membershipsResponse.json();
            console.log('📊 [Check Owner] Memberships data:', membershipsData);
            
            // If data is an array and has items, user has memberships (student)
            // If empty or no data, user is owner
            hasMembership = Array.isArray(membershipsData.data) && membershipsData.data.length > 0;
            isOwner = !hasMembership;
            
            console.log(hasMembership 
              ? '❌ [Check Owner] User HAS memberships - is a student' 
              : '✅ [Check Owner] User has NO memberships - is the owner'
            );
          } else {
            console.log('⚠️ [Check Owner] Memberships API returned:', membershipsResponse.status);
            // If we can't check memberships, assume owner (fail-open)
            isOwner = true;
          }
        } catch (membershipError: any) {
          console.error('❌ [Check Owner] Membership check error:', membershipError.message);
          // If membership check fails, assume owner (fail-open)
          isOwner = true;
        }
        
        return NextResponse.json({ 
          isOwner,
          userId: userId.substring(0, 10) + '...',
          companyId,
          method: 'membership_check',
          debug: {
            user_id: userId,
            has_membership: hasMembership,
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
