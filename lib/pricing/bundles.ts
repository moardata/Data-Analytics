/**
 * Bundle and Tier Mapping System
 * 
 * This file maps your preferred bundle names to internal tier system
 * Database uses: 'free', 'pro', 'premium'
 * Your bundles: 'atom', 'core', 'pulse', 'surge', 'quantum'
 */

export interface BundleInfo {
  tier: 'free' | 'pro' | 'premium';
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
  'prod_n8rHHckjTjJdD': { 
    tier: 'pro', 
    bundle: 'core', 
    displayName: 'Core',
    description: 'Core tier for growing creators',
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
  'prod_4ISBWlTlS81KL': { 
    tier: 'pro', 
    bundle: 'pulse', 
    displayName: 'Pulse',
    description: 'Pulse tier with advanced analytics',
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
  'prod_6O1w6a9outgyO': { 
    tier: 'premium', 
    bundle: 'surge', 
    displayName: 'Surge',
    description: 'Surge tier with alerts and white-label',
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
  'prod_bm98P1RCFrFmF': { 
    tier: 'premium', 
    bundle: 'quantum', 
    displayName: 'Quantum',
    description: 'Quantum tier with custom AI and dedicated support',
    features: {
      aiFeatures: ['20 daily AI insights + custom on-demand', 'Custom AI fine-tuning', 'Multi-account management'],
      dataCollection: ['Unlimited forms + full API', 'White-label everything'],
      exportIntegration: ['Full API access'],
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
    tier: 'pro',
    bundle: 'core',
    displayName: 'Core',
    description: 'Core tier for growing creators',
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
export function getTierForPlan(planId: string): 'free' | 'pro' | 'premium' {
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
export function getBundlesByTier(tier: 'free' | 'pro' | 'premium'): BundleInfo[] {
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
