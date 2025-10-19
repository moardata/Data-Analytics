/**
 * Whop SDK Client - NEW @whop/sdk (October 2025)
 * 
 * This is the CORRECT SDK for Whop apps
 * Replaces the old @whop/api package
 */

import Whop from '@whop/sdk';

// Create Whop client instance
export const whopClient = new Whop({
  appID: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
  apiKey: process.env.WHOP_API_KEY!,
});

// Export for easy importing
export default whopClient;

