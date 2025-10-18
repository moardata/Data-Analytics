import { NextRequest, NextResponse } from 'next/server';
import { getUserPermissions } from '@/lib/auth/permissions';

/**
 * Permissions API Endpoint
 * Checks if the current user has permission to access analytics data
 * Only course owners and admins are authorized
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    // Get user permissions
    const permissions = await getUserPermissions(companyId);

    return NextResponse.json({
      success: true,
      permissions,
      message: permissions.isAuthorized 
        ? 'User is authorized to access analytics'
        : 'User is not authorized to access analytics'
    });

  } catch (error: any) {
    console.error('Error checking permissions:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check permissions',
      permissions: {
        isAuthorized: false,
        userRole: 'unknown',
        canViewAnalytics: false,
        canManageData: false,
        canSyncStudents: false,
        canAccessSettings: false
      }
    }, { status: 500 });
  }
}
