import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { whopSdk } from '@/lib/whop-sdk';

/**
 * Check if user owns the company using Whop SDK
 * Falls back to checking if user has owner-level access
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

    const headersList = await headers();
    const whopUserId = headersList.get('x-whop-user-id');
    const whopAccessToken = headersList.get('x-whop-access-token');
    
    console.log('🔐 [Check Owner] Whop Headers:', {
      hasUserId: !!whopUserId,
      hasAccessToken: !!whopAccessToken,
      requestedCompany: companyId,
    });

    // If no headers, try to verify using Whop SDK
    if (!whopUserId || !whopAccessToken) {
      console.log('⚠️ [Check Owner] No Whop headers - trying SDK validation...');
      
      try {
        // Try to verify the user token from headers
        const tokenResult = await whopSdk.verifyUserToken(headersList);
        
        if (tokenResult?.userId) {
          console.log('✅ [Check Owner] Got user from SDK:', tokenResult.userId);
          
          // Check if user has owner access to this company
          const accessCheck = await whopSdk.access.checkIfUserHasAccessToCompany({
            userId: tokenResult.userId,
            companyId,
          });
          
          const isOwner = accessCheck?.accessLevel?.toString().toLowerCase() === 'owner' ||
                         accessCheck?.accessLevel?.toString().toLowerCase() === 'creator';
          
          console.log('🔍 [Check Owner] Access check result:', {
            userId: tokenResult.userId,
            accessLevel: accessCheck?.accessLevel,
            isOwner,
          });
          
          return NextResponse.json({ 
            isOwner,
            userId: tokenResult.userId,
            accessLevel: accessCheck?.accessLevel,
          });
        }
      } catch (sdkError) {
        console.error('❌ [Check Owner] SDK error:', sdkError);
      }
      
      // No headers and SDK failed - default to student
      console.log('⚠️ [Check Owner] No auth available - defaulting to STUDENT');
      return NextResponse.json({ 
        isOwner: false,
        reason: 'No Whop authentication available',
      });
    }

    // If we have headers, use them
    // For now, if there's a user ID, assume they're the owner
    // (You can enhance this later to check actual ownership)
    const isOwner = !!whopUserId;
    
    console.log('🔍 [Check Owner] Result from headers:', { isOwner });

    return NextResponse.json({ 
      isOwner,
      userId: whopUserId,
    });

  } catch (error: any) {
    console.error('❌ [Check Owner] Error:', error);
    return NextResponse.json({ 
      isOwner: false,
      error: error.message 
    });
  }
}
