/**
 * Middleware to enforce owner/admin-only access to API routes
 * Based on GPT's security recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOwner as requireOwnerAuth } from '@/lib/auth/auth-helpers';

export interface AuthContext {
  userId: string;
  companyId: string;
  role: 'owner' | 'admin' | 'member' | 'test';
  isOwner: boolean;
  isAdmin: boolean;
}

/**
 * Require owner or admin access
 * Returns 403 for members/students
 */
export async function requireOwner(request: NextRequest): Promise<{ 
  auth: AuthContext | null; 
  error: NextResponse | null 
}> {
  try {
    const auth = await requireOwnerAuth(request);
    
    // Map accessLevel to role (requireOwner ensures it's owner/admin, never 'none')
    // In whop-auth, 'admin' from Whop maps to 'owner' in our system
    const role: 'owner' | 'admin' | 'member' | 'test' = 
      auth.accessLevel === 'owner' || auth.accessLevel === 'admin' 
        ? 'owner' 
        : 'member'; // Fallback (shouldn't happen with requireOwner)
    
    return {
      auth: {
        userId: auth.userId,
        companyId: auth.companyId,
        role,
        isOwner: auth.isOwner,
        isAdmin: auth.isAdmin,
      },
      error: null,
    };
    
  } catch (error: any) {
    console.error('❌ [requireOwner] Authentication failed:', error);
    
    return {
      auth: null,
      error: NextResponse.json(
        { 
          error: 'Unauthorized',
          message: error.message || 'Authentication failed',
          requiredRole: 'owner or admin',
        },
        { status: 401 }
      ),
    };
  }
}

/**
 * Set Postgres session variables for RLS
 * Based on GPT's recommendation
 */
export function getRLSSessionVars(auth: AuthContext): string {
  // These will be used in RLS policies
  return `
    SET LOCAL app.tenant_id = '${auth.companyId}';
    SET LOCAL app.role = '${auth.role}';
    SET LOCAL app.user_id = '${auth.userId}';
  `;
}

