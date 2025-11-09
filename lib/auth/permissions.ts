/**
 * Permission System for Whop Analytics App
 * Ensures only course owners/admins can access analytics data
 * 
 * NOW USES: Unified Whop Authentication System (whop-auth-unified.ts)
 */

import { authenticateWhopUser } from './whop-auth';

export interface UserPermissions {
  userId?: string;
  canViewAnalytics: boolean;
  canManageData: boolean;
  canSyncStudents: boolean;
  canAccessSettings: boolean;
  userRole: 'owner' | 'admin' | 'member' | 'unknown';
  isAuthorized: boolean;
}

/**
 * Get user permissions for the current company
 * Now uses the unified auth system
 */
export async function getUserPermissions(
  companyId: string,
  userId?: string
): Promise<UserPermissions> {
  try {
    // Create a mock request for authentication
    const mockUrl = `https://app.com?companyId=${companyId}`;
    const mockRequest = new Request(mockUrl);
    
    // Use the new authentication system
    const auth = await authenticateWhopUser(mockRequest);
    
    // Determine permissions based on access level
    const isAuthorized = auth.isOwner || auth.isAdmin;
    
    return {
      userId: auth.userId,
      canViewAnalytics: auth.isAuthenticated, // All authenticated users can view
      canManageData: isAuthorized, // Only admins/owners
      canSyncStudents: isAuthorized, // Only admins/owners
      canAccessSettings: isAuthorized, // Only admins/owners
      userRole: auth.accessLevel === 'none' ? 'unknown' : auth.accessLevel,
      isAuthorized
    };

  } catch (error) {
    console.error('❌ Error getting user permissions:', error);
    
    // Unauthorized response (no fallback to admin!)
    return {
      userId: userId,
      canViewAnalytics: false,
      canManageData: false,
      canSyncStudents: false,
      canAccessSettings: false,
      userRole: 'unknown',
      isAuthorized: false
    };
  }
}

/**
 * Require authorization - throws error if user is not authorized
 */
export async function requireAuthorization(companyId: string): Promise<UserPermissions> {
  const permissions = await getUserPermissions(companyId);
  
  if (!permissions.isAuthorized) {
    throw new Error('Unauthorized: Only course owners and admins can access analytics data');
  }
  
  return permissions;
}

/**
 * Check if user is authorized for a specific action
 */
export async function isAuthorizedForAction(
  companyId: string,
  action: 'viewAnalytics' | 'manageData' | 'syncStudents' | 'accessSettings'
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(companyId);
    
    switch (action) {
      case 'viewAnalytics':
        return permissions.canViewAnalytics;
      case 'manageData':
        return permissions.canManageData;
      case 'syncStudents':
        return permissions.canSyncStudents;
      case 'accessSettings':
        return permissions.canAccessSettings;
      default:
        return false;
    }
  } catch (error) {
    console.error('Authorization check failed:', error);
    return false;
  }
}
