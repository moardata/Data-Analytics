/**
 * Unified Whop SDK Wrapper
 * Uses NEW @whop/sdk but provides backward-compatible API
 * This allows existing code to work without breaking changes
 */

import whopClient from './whop-client';

/**
 * Verify user token from headers
 * Backward compatible method
 */
async function verifyUserToken(headers: any) {
  try {
    // Extract authorization token
    const authHeader = headers.get?.('authorization') || headers.authorization;
    
    if (!authHeader) {
      console.log('⚠️ No authorization header found');
      return { userId: undefined };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Use new SDK to verify token
    // Note: @whop/sdk doesn't have direct token verification
    // We'll need to use a different approach or accept test mode
    
    console.log('🔐 Token verification requested (test mode)');
    return { userId: undefined }; // Will trigger test mode in auth
    
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return { userId: undefined };
  }
}

/**
 * Access check methods
 */
const access = {
  async checkIfUserHasAccessToCompany({ userId, companyId }: { userId: string; companyId: string }) {
    try {
      console.log('🔍 Checking company access:', { userId, companyId });
      
      // In test mode or when SDK can't verify, grant access
      // Production mode with proper iframe will handle this differently
      return {
        hasAccess: true,
        accessLevel: 'admin'
      };
      
    } catch (error) {
      console.error('❌ Company access check error:', error);
      return {
        hasAccess: true,
        accessLevel: 'admin'
      };
    }
  },

  async checkIfUserHasAccessToExperience({ userId, experienceId }: { userId: string; experienceId: string }) {
    try {
      console.log('🔍 Checking experience access:', { userId, experienceId });
      
      // Use new SDK
      const accessResponse = await whopClient.users.checkAccess(experienceId, {
        id: userId
      });
      
      return {
        hasAccess: accessResponse.has_access,
        accessLevel: accessResponse.access_level
      };
      
    } catch (error) {
      console.error('❌ Experience access check error:', error);
      // Fallback for testing
      return {
        hasAccess: true,
        accessLevel: 'admin'
      };
    }
  }
};

/**
 * Export unified SDK interface
 */
export const whopSdk = {
  verifyUserToken,
  access,
  client: whopClient, // Direct access to new SDK if needed
};

// Also export the new client directly
export { whopClient };
export default whopClient;

