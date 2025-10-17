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
}

/**
 * Map Whop plan IDs to bundle information
 */
export const PLAN_TO_BUNDLE: Record<string, BundleInfo> = {
  'plan_gDIQ1ypIFaZoQ': { 
    tier: 'free', 
    bundle: 'atom', 
    displayName: 'Atom',
    description: 'Free tier with basic features'
  },
  'plan_hnYnLn6egXRis': { 
    tier: 'pro', 
    bundle: 'core', 
    displayName: 'Core',
    description: '$20/month - Professional features'
  },
  'plan_OvGPVPXu6sarv': { 
    tier: 'pro', 
    bundle: 'pulse', 
    displayName: 'Pulse',
    description: '$100/month - Advanced analytics'
  },
  'plan_YWwjHKXiWT6vq': { 
    tier: 'premium', 
    bundle: 'surge', 
    displayName: 'Surge',
    description: '$200/month - Premium features'
  },
  'plan_BcSpDXIeGcklw': { 
    tier: 'premium', 
    bundle: 'quantum', 
    displayName: 'Quantum',
    description: '$400/month - Enterprise features'
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
    description: 'Free tier with basic features'
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
