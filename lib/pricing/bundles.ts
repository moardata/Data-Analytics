/**
 * Bundle and Tier Mapping System
 * 
 * Maps Whop plan IDs to tier names used throughout the application
 * Tier names: 'starter', 'growth', 'pro', 'scale'
 * These match the TierName type in tiers.ts for consistency
 */

export interface BundleInfo {
  tier: 'starter' | 'growth' | 'pro' | 'scale';  // FIXED: Use actual tier names
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
  'plan_Axr22QP0Sj86G': {  // FIXED: Correct NEW Starter product plan ID
    tier: 'starter',
    bundle: 'starter',
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
  },
  
  // LEGACY: Old "Data Analytics" product plan ID (for existing customers)
  'plan_s6HjlvFf74KE0': {
    tier: 'starter',
    bundle: 'starter',
    displayName: 'Starter (Legacy)',
    description: 'Legacy Starter tier from old product',
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
  'plan_IrOqGUheWuL1x': {  // FIXED: Correct plan ID
    tier: 'growth',
    bundle: 'growth',
    displayName: 'Growth',
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
  'plan_Jbp6KtLwdbZ0k': {  // FIXED: Correct plan ID
    tier: 'pro',
    bundle: 'pro',
    displayName: 'Pro',
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
  'plan_ioOlKM9cTtESv': {  // FIXED: Correct plan ID
    tier: 'scale',
    bundle: 'scale',
    displayName: 'Scale',
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
    tier: 'starter',  // FIXED: Default to 'starter'
    bundle: 'starter',
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
export function getTierForPlan(planId: string): 'starter' | 'growth' | 'pro' | 'scale' {
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
export function getBundlesByTier(tier: 'starter' | 'growth' | 'pro' | 'scale'): BundleInfo[] {
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
