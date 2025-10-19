/**
 * Middleware to enforce owner/admin-only access to API routes
 * Based on GPT's security recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { simpleAuth } from '@/lib/auth/simple-auth';

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
    const auth = await simpleAuth(request);
    
    // Check if user is owner or admin
    if (!auth.isOwner && !auth.isAdmin) {
      console.error('❌ [requireOwner] Access denied - user is not owner/admin:', {
        userId: auth.userId,
        role: auth.accessLevel,
        isOwner: auth.isOwner,
        isAdmin: auth.isAdmin,
      });
      
      return {
        auth: null,
        error: NextResponse.json(
          { 
            error: 'Forbidden',
            message: 'This endpoint requires owner or admin access',
            requiredRole: 'owner or admin',
            yourRole: auth.accessLevel,
          },
          { status: 403 }
        ),
      };
    }
    
    console.log('✅ [requireOwner] Access granted:', {
      userId: auth.userId,
      companyId: auth.companyId,
      role: auth.accessLevel,
      isOwner: auth.isOwner,
    });
    
    return {
      auth: {
        userId: auth.userId,
        companyId: auth.companyId,
        role: auth.accessLevel,
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
          message: 'Authentication failed',
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

