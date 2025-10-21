import { NextRequest, NextResponse } from 'next/server';
import whopClient from '@/lib/whop-client';

/**
 * Check if current user is the owner of a company
 * 
 * ISSUE: Whop doesn't provide user context in iframe apps
 * SOLUTION: Use Whop API to check company ownership
 * 
 * For now, we'll use a simpler approach:
 * - Try to verify ownership via Whop API
 * - If that fails, grant access (fail-open temporarily)
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
    console.log('🔍 [Check Owner] Checking all request headers...');
    
    // Log ALL headers to see what Whop is actually sending
    const headersList = request.headers;
    const allHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      allHeaders[key] = value.substring(0, 100); // First 100 chars
    });
    console.log('📋 [Check Owner] All headers:', JSON.stringify(allHeaders, null, 2));

    // Try to get user ID from various header possibilities
    const possibleUserHeaders = [
      'x-whop-user-id',
      'whop-user-id', 
      'user-id',
      'x-user-id',
      'authorization',
      'x-whop-token',
      'whop-token'
    ];
    
    let userId: string | undefined;
    for (const headerName of possibleUserHeaders) {
      const value = headersList.get(headerName);
      if (value) {
        console.log(`✅ [Check Owner] Found header ${headerName}:`, value.substring(0, 50));
        userId = value;
        break;
      }
    }

    if (!userId) {
      console.log('⚠️ [Check Owner] No user ID in headers - cannot determine ownership');
      console.log('⚠️ [Check Owner] Granting access (fail-open) until Whop auth is configured');
      
      // TEMPORARY: Grant access when we can't determine user
      return NextResponse.json({ 
        isOwner: true,
        temporary: true,
        reason: 'No Whop user headers found - granting access',
        note: 'Add ENABLE_TEST_MODE=true to Vercel env OR configure Whop app OAuth scopes'
      });
    }

    // If we have a user ID, try to check ownership via Whop API
    try {
      console.log('🔍 [Check Owner] Checking ownership via Whop API...');
      
      const company = await whopClient.companies.retrieve(companyId);
      const companyData = company as any;
      
      console.log('📊 [Check Owner] Company data:', {
        id: companyData.id,
        owner_id: companyData.owner_id,
        created_by: companyData.created_by,
      });
      
      // Check if user is the owner
      const isOwner = companyData.owner_id === userId || 
                     companyData.created_by === userId ||
                     companyData.creator_id === userId;
      
      console.log(isOwner ? '✅ [Check Owner] User IS the owner' : '❌ [Check Owner] User is NOT the owner');
      
      return NextResponse.json({ 
        isOwner,
        userId: userId.substring(0, 10) + '...',
        companyId,
        method: 'whop_api'
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

  } catch (error: any) {
    console.error('❌ [Check Owner] Error:', error);
    return NextResponse.json({ 
      isOwner: true, // Fail-open for now
      temporary: true,
      error: error.message 
    });
  }
}
