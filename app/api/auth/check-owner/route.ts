import { NextRequest, NextResponse } from 'next/server';

/**
 * SIMPLIFIED: Just return isOwner=true for everyone
 * 
 * WHY: Whop is not sending authentication headers and SDK is failing
 * This allows the app to function while we figure out proper Whop auth
 * 
 * TODO: Implement proper Whop authentication when we understand how Whop Forms does it
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

    console.log('⚠️ [Check Owner] TEMPORARY: Returning isOwner=true for everyone');
    console.log('⚠️ [Check Owner] Need to implement proper Whop authentication');

    // TEMPORARY: Everyone is owner until we fix Whop auth
    return NextResponse.json({ 
      isOwner: true,
      temporary: true,
      note: 'Whop authentication not configured - granting access to all users',
    });

  } catch (error: any) {
    console.error('❌ [Check Owner] Error:', error);
    return NextResponse.json({ 
      isOwner: true, // Fail-open for now
      error: error.message 
    });
  }
}
