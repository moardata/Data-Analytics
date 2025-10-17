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
  'plan_gDIQ1ypIFaZoQ': { 
    tier: 'free', 
    bundle: 'atom', 
    displayName: 'Atom',
    description: 'Free tier with basic analytics',
    features: {
      aiFeatures: ['1 daily insight (aggregated)'],
      dataCollection: ['Basic webhooks + form data'],
      exportIntegration: ['None'],
      retentionWindow: '7 days',
      support: 'Community only'
    },
    pricing: {
      monthly: 0,
      currency: 'USD'
    }
  },
  'plan_hnYnLn6egXRis': { 
    tier: 'pro', 
    bundle: 'core', 
    displayName: 'Core',
    description: 'Starter tier for growing creators',
    features: {
      aiFeatures: ['5 daily insights + sentiment'],
      dataCollection: ['Engagement + survey + sales data'],
      exportIntegration: ['CSV export'],
      retentionWindow: '30 days',
      support: 'Email'
    },
    pricing: {
      monthly: 20,
      currency: 'USD'
    }
  },
  'plan_OvGPVPXu6sarv': { 
    tier: 'pro', 
    bundle: 'pulse', 
    displayName: 'Pulse',
    description: 'Growth tier with advanced analytics',
    features: {
      aiFeatures: ['10 daily AI insights + trend charting'],
      dataCollection: ['All webhooks + form history'],
      exportIntegration: ['CSV / PDF'],
      retentionWindow: '90 days',
      support: 'Priority chat'
    },
    pricing: {
      monthly: 100,
      currency: 'USD'
    }
  },
  'plan_YWwjHKXiWT6vq': { 
    tier: 'premium', 
    bundle: 'surge', 
    displayName: 'Surge',
    description: 'Professional tier with API access',
    features: {
      aiFeatures: ['25 AI insights + forecasting + cluster segmentation'],
      dataCollection: ['Real-time student feed'],
      exportIntegration: ['CSV / PDF / API'],
      retentionWindow: '180 days',
      support: 'Priority + branding'
    },
    pricing: {
      monthly: 200,
      currency: 'USD'
    }
  },
  'plan_BcSpDXIeGcklw': { 
    tier: 'premium', 
    bundle: 'quantum', 
    displayName: 'Quantum',
    description: 'Enterprise tier with custom AI',
    features: {
      aiFeatures: ['Custom LLM fine-tuned insights + multi-account'],
      dataCollection: ['Cross-community analytics'],
      exportIntegration: ['Full API + data stream'],
      retentionWindow: '365 days',
      support: 'Dedicated manager'
    },
    pricing: {
      monthly: 400,
      currency: 'USD'
    }
  },
};

/**
 * Get bundle information for a plan ID
 */
export function getBundleInfo(planId: string): BundleInfo {
  return PLAN_TO_BUNDLE[planId] || {
    tier: 'free',
    bundle: 'atom',
    displayName: 'Atom',
    description: 'Free tier with basic analytics',
    features: {
      aiFeatures: ['1 daily insight (aggregated)'],
      dataCollection: ['Basic webhooks + form data'],
      exportIntegration: ['None'],
      retentionWindow: '7 days',
      support: 'Community only'
    },
    pricing: {
      monthly: 0,
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
