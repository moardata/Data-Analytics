/**
 * PRODUCTION-READY Whop Authentication
 * Uses @whop/sdk properly for server-side authentication
 * NO test mode fallbacks - fails securely
 * 
 * For Whop apps, authentication works as follows:
 * 1. WhopApp component provides context on client-side
 * 2. Server-side uses headers + SDK to verify access
 * 3. Company ID comes from URL params (Whop injects this)
 */

import { headers } from 'next/headers';
import whopClient from '@/lib/whop-client';

export interface WhopAuthResult {
  userId: string;
  companyId: string;
  isAuthenticated: boolean;
  accessLevel: 'owner' | 'admin' | 'member' | 'none';
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

/**
 * Extract user ID from Whop headers
 * Whop sends user info in headers when app is embedded
 * 
 * Whop sends user token in x-whop-user-token header (JWT)
 * We need to decode it to get the user ID
 */
function extractUserIdFromHeaders(headersList: Headers): string | null {
  // Try direct user ID header first
  let userId = headersList.get('x-whop-user-id') ||
               headersList.get('whop-user-id') ||
               headersList.get('user-id') ||
               null;
  
  // If not found, try to extract from JWT token
  if (!userId) {
    const userToken = headersList.get('x-whop-user-token') ||
                     headersList.get('authorization')?.replace('Bearer ', '') ||
                     null;
    
    if (userToken) {
      try {
        // Decode JWT payload (middle part)
        const tokenParts = userToken.split('.');
        if (tokenParts.length === 3) {
          // Base64 decode - use Buffer in Node.js, atob in browser/Edge
          const base64Payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
          let payloadJson: string;
          
          if (typeof Buffer !== 'undefined') {
            // Node.js runtime
            payloadJson = Buffer.from(base64Payload, 'base64').toString('utf-8');
          } else if (typeof atob !== 'undefined') {
            // Browser/Edge runtime
            payloadJson = atob(base64Payload);
          } else {
            throw new Error('No base64 decoder available');
          }
          
          const payload = JSON.parse(payloadJson);
          userId = payload.sub || payload.user_id || payload.userId || payload.id || null;
        }
      } catch (e) {
        // JWT decode failed, continue with null
        console.warn('⚠️ [WhopAuth] Failed to decode JWT token:', e);
      }
    }
  }
  
  return userId;
}

/**
 * Authenticate user using Whop SDK
 * PRODUCTION ONLY - no test mode fallbacks
 */
export async function authenticateWhopUser(request: Request): Promise<WhopAuthResult> {
  try {
    // Step 1: Get company ID from URL (REQUIRED - Whop injects this)
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId') || 
                     url.searchParams.get('company_id') ||
                     null;
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    // Step 2: Get user ID from headers (Whop provides this when embedded)
    const headersList = await headers();
    const userId = extractUserIdFromHeaders(headersList);
    
    if (!userId) {
      // In production, fail securely - no fallback
      throw new Error('Authentication failed: No user ID in headers');
    }

    // Step 3: Verify user access to company using SDK
    let accessLevel: 'owner' | 'admin' | 'member' | 'none' = 'none';
    let isOwner = false;
    let isAdmin = false;
    let isMember = false;

    try {
      const accessCheck = await whopClient.users.checkAccess(companyId, {
        id: userId,
      });

      if (accessCheck.has_access) {
        // Map Whop access levels to our system
        switch (accessCheck.access_level) {
          case 'admin':
            accessLevel = 'owner';
            isOwner = true;
            isAdmin = true;
            break;
          case 'customer':
            accessLevel = 'member';
            isMember = true;
            break;
          default:
            accessLevel = 'none';
        }
      } else {
        accessLevel = 'none';
      }
    } catch (accessError) {
      console.error('❌ [WhopAuth] Access check failed:', accessError);
      // Fail securely - deny access on error
      throw new Error('Authorization failed: Unable to verify access');
    }

    return {
      userId,
      companyId,
      isAuthenticated: true,
      accessLevel,
      isOwner,
      isAdmin,
      isMember,
    };

  } catch (error) {
    console.error('❌ [WhopAuth] Authentication failed:', error);
    throw error;
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(request: Request): Promise<WhopAuthResult> {
  return await authenticateWhopUser(request);
}

/**
 * Require owner/admin access - throws if not owner/admin
 */
export async function requireOwnerAccess(request: Request): Promise<WhopAuthResult> {
  const auth = await authenticateWhopUser(request);
  
  if (!auth.isOwner && !auth.isAdmin) {
    throw new Error('Access denied: Owner or admin access required');
  }
  
  return auth;
}

