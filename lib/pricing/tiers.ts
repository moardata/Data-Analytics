/**
 * Pricing Tiers for Creator Analytics
 * Based on Whop group sizes and realistic creator needs
 */

export type TierName = 'starter' | 'growth' | 'pro' | 'scale';

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
  starter: {
    name: 'starter',
    displayName: 'Starter',
    price: 30,
    currency: 'USD',
    whopPlanId: 'prod_n8rHHckjTjJdD',
    limits: {
      maxStudents: 100,
      maxForms: 999, // Unlimited custom forms
      aiInsightsPerDay: 5,
      aiInsightsHistory: 14, // 14-day data retention
      dataExport: false,
      advancedAnalytics: false, // 3 of 6 core dashboard metrics
      emailSupport: true, // 72hr support
      prioritySupport: false,
      customBranding: false,
    },
    features: [
      '5 daily AI insights',
      'Up to 100 students',
      '3 core dashboard metrics',
      'Unlimited custom forms',
      '100 responses analyzed/month',
      '14-day data retention',
      'Email support (72hr)',
    ],
  },

  growth: {
    name: 'growth',
    displayName: 'Growth',
    price: 99,
    currency: 'USD',
    whopPlanId: 'prod_4ISBWlTlS81KL',
    limits: {
      maxStudents: 1000,
      maxForms: 999, // Unlimited forms + branching logic
      aiInsightsPerDay: 10,
      aiInsightsHistory: 60, // 60-day data retention
      dataExport: true, // CSV exports
      advancedAnalytics: true, // Full dashboard (all 6 metrics)
      emailSupport: true, // 48hr support
      prioritySupport: false,
      customBranding: false,
    },
    features: [
      '10 daily AI insights',
      'Up to 1,000 students',
      'Full dashboard (all 6 metrics)',
      'Unlimited forms + branching logic',
      '1,000 responses analyzed/month',
      '60-day data retention',
      'CSV exports',
      'Time range filters (1D/7D/1M)',
      'Email support (48hr)',
    ],
  },

  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 299,
    currency: 'USD',
    whopPlanId: 'prod_6O1w6a9outgyO',
    limits: {
      maxStudents: 2000,
      maxForms: 999, // Unlimited forms + white-label
      aiInsightsPerDay: 15,
      aiInsightsHistory: 180, // 180-day data retention
      dataExport: true, // CSV + PDF exports
      advancedAnalytics: true, // Full dashboard + automated alerts
      emailSupport: true,
      prioritySupport: true, // Priority support (24hr) + live chat
      customBranding: true, // White-label
    },
    features: [
      '15 daily AI insights',
      'Up to 2,000 students',
      'Full dashboard + automated alerts',
      'Unlimited forms + white-label',
      '10,000 responses analyzed/month',
      '180-day data retention',
      'CSV + PDF exports',
      'At-risk student alerts',
      'Cohort analysis',
      'Priority support (24hr) + live chat',
    ],
  },

  scale: {
    name: 'scale',
    displayName: 'Scale',
    price: 599,
    currency: 'USD',
    whopPlanId: 'prod_bm98P1RCFrFmF',
    limits: {
      maxStudents: 999999, // 2,000+ students (unlimited)
      maxForms: 999, // Unlimited forms + full API
      aiInsightsPerDay: 20, // 20 daily AI insights + custom on-demand
      aiInsightsHistory: 365, // 365-day data retention
      dataExport: true, // Full API access
      advancedAnalytics: true, // Custom AI fine-tuning
      emailSupport: true,
      prioritySupport: true,
      customBranding: true, // White-label everything
    },
    features: [
      '20 daily AI insights + custom on-demand',
      '2,000+ students (unlimited)',
      'Custom AI fine-tuning',
      'Unlimited forms + full API',
      'Unlimited responses analyzed',
      '365-day data retention',
      'Full API access',
      'White-label everything',
      'Multi-account management',
      'Dedicated success manager (2hr SLA)',
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


