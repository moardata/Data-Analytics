/**
 * Bundle and Tier Mapping System
 * 
 * Maps Whop plan IDs to tier names used throughout the application
 * Tier names: 'atom', 'core', 'pulse', 'surge'
 * These match the TierName type in tiers.ts for consistency
 */

export interface BundleInfo {
  tier: 'atom' | 'core' | 'pulse' | 'surge';  // FIXED: Use actual tier names from tiers.ts
  bundle: string;
  displayName: string;
  description: string;
  features: {
    aiFeatures: string[];
    dataCollection: string[];
    exportIntegration: string[];
    retentionWindow: string;
    support: string;
  };
  pricing: {
    monthly: number;
    currency: string;
  };
}

/**
 * Map Whop plan IDs to bundle information
 * Based on your tier features table
 */
export const PLAN_TO_BUNDLE: Record<string, BundleInfo> = {
  'prod_Tdu9YayfFDxhc': { 
    tier: 'atom',  // FIXED: Matches tiers.ts
    bundle: 'atom',  // FIXED: Tier and bundle are the same
    displayName: 'Starter',  // FIXED: Matches tiers.ts displayName
    description: 'Starter tier for new creators',
    features: {
      aiFeatures: ['5 daily AI insights'],
      dataCollection: ['Unlimited custom forms'],
      exportIntegration: ['None'],
      retentionWindow: '14 days',
      support: 'Email (72hr)'
    },
    pricing: {
      monthly: 30,
      currency: 'USD'
    }
  },
  'prod_UNx31yqmQcXOx': { 
    tier: 'core',  // FIXED: Matches tiers.ts
    bundle: 'core',  // FIXED: Tier and bundle are the same
    displayName: 'Growth',  // FIXED: Matches tiers.ts displayName
    description: 'Growth tier with advanced analytics',
    features: {
      aiFeatures: ['10 daily AI insights', 'Full dashboard (all 6 metrics)'],
      dataCollection: ['Unlimited forms + branching logic', 'Time range filters'],
      exportIntegration: ['CSV exports'],
      retentionWindow: '60 days',
      support: 'Email (48hr)'
    },
    pricing: {
      monthly: 99,
      currency: 'USD'
    }
  },
  'prod_03fZxoux0PVvW': { 
    tier: 'pulse',  // FIXED: Matches tiers.ts
    bundle: 'pulse',  // FIXED: Tier and bundle are the same
    displayName: 'Pro',  // FIXED: Matches tiers.ts displayName
    description: 'Pro tier with alerts and white-label',
    features: {
      aiFeatures: ['15 daily AI insights', 'At-risk student alerts', 'Cohort analysis'],
      dataCollection: ['Unlimited forms + white-label'],
      exportIntegration: ['CSV + PDF exports'],
      retentionWindow: '180 days',
      support: 'Priority (24hr) + live chat'
    },
    pricing: {
      monthly: 299,
      currency: 'USD'
    }
  },
  'prod_QFtQEu91TO2yh': { 
    tier: 'surge',  // FIXED: Matches tiers.ts
    bundle: 'surge',  // FIXED: Tier and bundle are the same
    displayName: 'Scale',  // FIXED: Matches tiers.ts displayName
    description: 'Scale tier with custom AI and dedicated support',
    features: {
      aiFeatures: ['20 daily AI insights + custom on-demand', 'Custom AI fine-tuning', 'Multi-account management'],
      dataCollection: ['Unlimited forms', 'White-label everything'],
      exportIntegration: ['CSV + PDF + Advanced exports'],
      retentionWindow: '365 days',
      support: 'Dedicated success manager (2hr SLA)'
    },
    pricing: {
      monthly: 599,
      currency: 'USD'
    }
  },
};

/**
 * Get bundle information for a plan ID
 */
export function getBundleInfo(planId: string): BundleInfo {
  return PLAN_TO_BUNDLE[planId] || {
    tier: 'atom',  // FIXED: Default to 'atom' (starter tier)
    bundle: 'atom',
    displayName: 'Starter',
    description: 'Starter tier for new creators',
    features: {
      aiFeatures: ['5 daily AI insights'],
      dataCollection: ['Unlimited custom forms'],
      exportIntegration: ['None'],
      retentionWindow: '14 days',
      support: 'Email (72hr)'
    },
    pricing: {
      monthly: 30,
      currency: 'USD'
    }
  };
}

/**
 * Get tier for a plan ID (for database compatibility)
 */
export function getTierForPlan(planId: string): 'atom' | 'core' | 'pulse' | 'surge' {
  return getBundleInfo(planId).tier;
}

/**
 * Get bundle name for a plan ID
 */
export function getBundleForPlan(planId: string): string {
  return getBundleInfo(planId).bundle;
}

/**
 * Get display name for a plan ID
 */
export function getDisplayNameForPlan(planId: string): string {
  return getBundleInfo(planId).displayName;
}

/**
 * Get all available bundles
 */
export function getAllBundles(): BundleInfo[] {
  return Object.values(PLAN_TO_BUNDLE);
}

/**
 * Get bundles by tier
 */
export function getBundlesByTier(tier: 'atom' | 'core' | 'pulse' | 'surge'): BundleInfo[] {
  return getAllBundles().filter(bundle => bundle.tier === tier);
}

/**
 * Check if a bundle name is valid
 */
export function isValidBundle(bundleName: string): boolean {
  return getAllBundles().some(bundle => bundle.bundle === bundleName);
}

/**
 * Get bundle info by bundle name
 */
export function getBundleByName(bundleName: string): BundleInfo | null {
  return getAllBundles().find(bundle => bundle.bundle === bundleName) || null;
}
