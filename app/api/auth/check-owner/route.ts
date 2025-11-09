import { NextRequest, NextResponse } from 'next/server';
import { requireOwnerAccess } from '@/lib/auth/whop-auth';

/**
 * Check if current user is the owner of a company
 * 
 * Uses proper Whop authentication system
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ 
        isOwner: false,
        error: 'No company ID provided'
      }, { status: 400 });
    }

    // Use proper Whop authentication
    try {
      const auth = await requireOwnerAccess(request);
      
      return NextResponse.json({ 
        isOwner: true,
        userId: auth.userId.substring(0, 10) + '...',
        companyId: auth.companyId,
        accessLevel: auth.accessLevel,
      });
    } catch (authError: any) {
      // In development only: Allow fallback for testing
      if (process.env.NODE_ENV === 'development' && authError.message.includes('No user ID')) {
        console.warn('⚠️ [Check Owner] Development mode: Using fallback auth');
        return NextResponse.json({ 
          isOwner: true,
          userId: 'dev_user',
          companyId,
          temporary: true,
          reason: 'development_fallback'
        });
      }
      
      // Production: Fail securely
      return NextResponse.json({ 
        isOwner: false,
        error: authError.message || 'Authentication failed'
      }, { status: 401 });
    }

  } catch (error: any) {
    console.error('❌ [Check Owner] Fatal error:', error);
    
    // Fail securely - deny access on error
    return NextResponse.json({ 
      isOwner: false,
      error: error.message || 'Authentication failed'
    }, { status: 401 });
  }
}
