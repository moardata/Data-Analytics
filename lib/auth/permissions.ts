/**
 * Permission System for Whop Analytics App
 * Ensures only course owners/admins can access analytics data
 */

import { headers } from 'next/headers';
import { whopSdk } from '@/lib/whop-sdk';

export interface UserPermissions {
  canViewAnalytics: boolean;
  canManageData: boolean;
  canSyncStudents: boolean;
  canAccessSettings: boolean;
  userRole: 'owner' | 'admin' | 'member' | 'unknown';
  isAuthorized: boolean;
}

export interface WhopUserContext {
  userId: string;
  companyId: string;
  role: string;
  permissions: string[];
  isOwner: boolean;
  isAdmin: boolean;
}

/**
 * Get user permissions for the current company
 * Only owners and admins should have access to analytics
 */
export async function getUserPermissions(
  companyId: string,
  userId?: string
): Promise<UserPermissions> {
  try {
    // If no userId provided, try to get from Whop auth
    if (!userId) {
      const auth = await getWhopAuth();
      if (!auth) {
        return createUnauthorizedPermissions();
      }
      userId = auth.userId;
    }

    // Get user context from Whop
    const userContext = await getUserContextFromWhop(companyId, userId);
    
    if (!userContext) {
      return createUnauthorizedPermissions();
    }

    // Only owners and admins can access analytics
    const isAuthorized = userContext.isOwner || userContext.isAdmin;
    
    return {
      canViewAnalytics: isAuthorized,
      canManageData: isAuthorized,
      canSyncStudents: isAuthorized,
      canAccessSettings: isAuthorized,
      userRole: userContext.isOwner ? 'owner' : userContext.isAdmin ? 'admin' : 'member',
      isAuthorized
    };

  } catch (error) {
    console.error('Error getting user permissions:', error);
    return createUnauthorizedPermissions();
  }
}

/**
 * Get user context from Whop API
 */
async function getUserContextFromWhop(
  companyId: string, 
  userId: string
): Promise<WhopUserContext | null> {
  try {
    // Use Whop API to get user's role in the company
    const response = await fetch(
      `https://api.whop.com/api/v2/companies/${companyId}/members/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.log('Failed to get user context from Whop API:', response.status);
      return null;
    }

    const userData = await response.json();
    
    return {
      userId,
      companyId,
      role: userData.role || 'member',
      permissions: userData.permissions || [],
      isOwner: userData.role === 'owner' || userData.is_owner === true,
      isAdmin: userData.role === 'admin' || userData.is_admin === true
    };

  } catch (error) {
    console.error('Error fetching user context from Whop:', error);
    return null;
  }
}

/**
 * Simplified auth check for Whop
 */
async function getWhopAuth(): Promise<{ userId: string } | null> {
  try {
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);
    return userId ? { userId } : null;
  } catch (error) {
    console.error('Error verifying Whop user token:', error);
    return null;
  }
}

/**
 * Create unauthorized permissions object
 */
function createUnauthorizedPermissions(): UserPermissions {
  return {
    canViewAnalytics: false,
    canManageData: false,
    canSyncStudents: false,
    canAccessSettings: false,
    userRole: 'unknown',
    isAuthorized: false
  };
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
}
