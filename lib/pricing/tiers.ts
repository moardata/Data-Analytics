/**
 * Pricing Tiers for Creator Analytics
 * Based on Whop group sizes and realistic creator needs
 */

export type TierName = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise';

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
  whopPlanId?: string; // Whop membership plan ID
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
  free: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    currency: 'USD',
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
      'Up to 20 students',
      '1 AI insight per day',
      '2 custom forms',
      'Basic analytics',
      '7-day insight history',
    ],
  },

  starter: {
    name: 'starter',
    displayName: 'Starter',
    price: 20,
    currency: 'USD',
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
      'Up to 200 students',
      '5 AI insights per day',
      '10 custom forms',
      'Basic analytics',
      'CSV/PDF exports',
      '30-day insight history',
      'Email support',
    ],
  },

  growth: {
    name: 'growth',
    displayName: 'Growth',
    price: 100,
    currency: 'USD',
    limits: {
      maxStudents: 2000, // Medium-large communities
      maxForms: 50,
      aiInsightsPerDay: 20,
      aiInsightsHistory: 90, // Keep insights for 3 months
      dataExport: true,
      advancedAnalytics: true,
      emailSupport: true,
      prioritySupport: false,
      customBranding: false,
    },
    features: [
      'Up to 2,000 students',
      '20 AI insights per day',
      '50 custom forms',
      'Advanced analytics',
      'CSV/PDF exports',
      '90-day insight history',
      'Email support',
    ],
  },

  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 200,
    currency: 'USD',
    limits: {
      maxStudents: 10000, // Large communities
      maxForms: 100,
      aiInsightsPerDay: 50,
      aiInsightsHistory: 180, // Keep insights for 6 months
      dataExport: true,
      advancedAnalytics: true,
      emailSupport: true,
      prioritySupport: true,
      customBranding: true,
    },
    features: [
      'Up to 10,000 students',
      '50 AI insights per day',
      '100 custom forms',
      'Advanced analytics',
      'CSV/PDF exports',
      '180-day insight history',
      'Priority support',
      'Custom branding',
    ],
  },

  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 400,
    currency: 'USD',
    limits: {
      maxStudents: 100000, // Mega communities
      maxForms: 500,
      aiInsightsPerDay: 200,
      aiInsightsHistory: 365, // Keep insights for 1 year
      dataExport: true,
      advancedAnalytics: true,
      emailSupport: true,
      prioritySupport: true,
      customBranding: true,
    },
    features: [
      'Up to 100,000 students',
      '200 AI insights per day',
      '500 custom forms',
      'Advanced analytics',
      'CSV/PDF exports',
      '365-day insight history',
      'Priority support',
      'Custom branding',
      'Dedicated account manager',
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


