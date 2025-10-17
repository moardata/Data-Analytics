/**
 * Pricing Tiers for Creator Analytics
 * Based on Whop group sizes and realistic creator needs
 */

export type TierName = 'atom' | 'core' | 'pulse' | 'surge' | 'quantum';

export interface PricingTier {
  name: TierName;
  displayName: string;
  price: number; // USD per month
  currency: 'USD';
  limits: {
    maxStudents: number;
    maxForms: number;
    aiInsightsPerDay: number;
    aiInsightsHistory: number; // Days to keep insights
    dataExport: boolean;
    advancedAnalytics: boolean;
    emailSupport: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
  features: string[];
  whopPlanId: string; // Whop product ID
}

/**
 * Pricing Tiers
 * 
 * Note: Typical Whop group sizes:
 * - Small courses: 10-100 members
 * - Medium communities: 100-1,000 members
 * - Large communities: 1,000-10,000 members
 * - Mega communities: 10,000-100,000+ members
 * 
 * We set limits slightly above typical sizes to allow growth
 */
export const PRICING_TIERS: Record<TierName, PricingTier> = {
  atom: {
    name: 'atom',
    displayName: 'Atom',
    price: 0,
    currency: 'USD',
    whopPlanId: 'plan_gDIQ1ypIFaZoQ',
    limits: {
      maxStudents: 20, // Perfect for testing/small courses
      maxForms: 2,
      aiInsightsPerDay: 1,
      aiInsightsHistory: 7, // Keep insights for 1 week
      dataExport: false,
      advancedAnalytics: false,
      emailSupport: false,
      prioritySupport: false,
      customBranding: false,
    },
    features: [
      '1 daily insight (aggregated)',
      'Basic webhooks + form data',
      '7-day retention window',
      'Community support only',
    ],
  },

  core: {
    name: 'core',
    displayName: 'Core',
    price: 20,
    currency: 'USD',
    whopPlanId: 'plan_hnYnLn6egXRis',
    limits: {
      maxStudents: 200, // Small-medium courses
      maxForms: 10,
      aiInsightsPerDay: 5,
      aiInsightsHistory: 30, // Keep insights for 1 month
      dataExport: true,
      advancedAnalytics: false,
      emailSupport: true,
      prioritySupport: false,
      customBranding: false,
    },
    features: [
      '5 daily insights + sentiment',
      'Engagement + survey + sales data',
      'CSV export',
      '30-day retention window',
      'Email support',
    ],
  },

  pulse: {
    name: 'pulse',
    displayName: 'Pulse',
    price: 100,
    currency: 'USD',
    whopPlanId: 'plan_OvGPVPXu6sarv',
    limits: {
      maxStudents: 2000, // Medium-large communities
      maxForms: 50,
      aiInsightsPerDay: 10,
      aiInsightsHistory: 90, // Keep insights for 3 months
      dataExport: true,
      advancedAnalytics: true,
      emailSupport: true,
      prioritySupport: false,
      customBranding: false,
    },
    features: [
      '10 daily AI insights + trend charting',
      'All webhooks + form history',
      'CSV / PDF export',
      '90-day retention window',
      'Priority chat support',
    ],
  },

  surge: {
    name: 'surge',
    displayName: 'Surge',
    price: 200,
    currency: 'USD',
    whopPlanId: 'plan_YWwjHKXiWT6vq',
    limits: {
      maxStudents: 10000, // Large communities
      maxForms: 100,
      aiInsightsPerDay: 25,
      aiInsightsHistory: 180, // Keep insights for 6 months
      dataExport: true,
      advancedAnalytics: true,
      emailSupport: true,
      prioritySupport: true,
      customBranding: true,
    },
    features: [
      '25 AI insights + forecasting + cluster segmentation',
      'Real-time student feed',
      'CSV / PDF / API export',
      '180-day retention window',
      'Priority support + branding',
    ],
  },

  quantum: {
    name: 'quantum',
    displayName: 'Quantum',
    price: 400,
    currency: 'USD',
    whopPlanId: 'plan_BcSpDXIeGcklw',
    limits: {
      maxStudents: 100000, // Mega communities
      maxForms: 500,
      aiInsightsPerDay: 999, // Unlimited custom LLM insights
      aiInsightsHistory: 365, // Keep insights for 1 year
      dataExport: true,
      advancedAnalytics: true,
      emailSupport: true,
      prioritySupport: true,
      customBranding: true,
    },
    features: [
      'Custom LLM fine-tuned insights + multi-account',
      'Cross-community analytics',
      'Full API + data stream export',
      '365-day retention window',
      'Dedicated manager support',
    ],
  },
};

/**
 * Get tier by name
 */
export function getTier(tierName: TierName): PricingTier {
  return PRICING_TIERS[tierName];
}

/**
 * Get all tiers (for pricing page)
 */
export function getAllTiers(): PricingTier[] {
  return Object.values(PRICING_TIERS);
}

/**
 * Check if a tier can perform an action
 */
export function canPerformAction(
  tier: TierName,
  action: 'export' | 'advancedAnalytics' | 'customBranding'
): boolean {
  const tierData = getTier(tier);
  switch (action) {
    case 'export':
      return tierData.limits.dataExport;
    case 'advancedAnalytics':
      return tierData.limits.advancedAnalytics;
    case 'customBranding':
      return tierData.limits.customBranding;
    default:
      return false;
  }
}


