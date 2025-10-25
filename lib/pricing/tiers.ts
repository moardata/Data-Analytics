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
  trialDays?: number; // Free trial period in days
  limits: {
    maxStudents: number;
    maxResponsesPerMonth: number; // AI-analyzed survey responses
    aiInsightsPerDay: number;
    dataRetentionDays: number;
    dashboardMetrics: string[]; // Which metrics are unlocked
    csvExport: boolean;
    pdfExport: boolean;
    apiAccess: boolean;
    timeFilters: boolean;
    formBranching: boolean;
    atRiskAlerts: boolean;
    whiteLabelForms: boolean;
    emailSupport: boolean;
    emailResponseTime: string; // e.g., "72hr", "48hr"
    liveChat: boolean;
    dedicatedManager: boolean;
  };
  features: string[];
  whopPlanId: string; // Whop product ID
}

/**
 * Pricing Tiers
 * 
 * Structure: Response-based limits (not form count)
 * - Unlimited forms for all tiers
 * - Cap on AI-analyzed responses per month (what costs us money)
 * - Progressive unlocking of dashboard metrics and features
 */
export const PRICING_TIERS: Record<TierName, PricingTier> = {
  starter: {
    name: 'starter',
    displayName: 'Starter',
    price: 30,
    currency: 'USD',
    trialDays: 7, // 7-day free trial
    whopPlanId: 'plan_gDIQ1ypIFaZoQ',
    limits: {
      maxStudents: 100,
      maxResponsesPerMonth: 100, // AI-analyzed survey responses
      aiInsightsPerDay: 5,
      dataRetentionDays: 14,
      dashboardMetrics: ['consistency', 'popular', 'feedback'], // 3 of 6 unlocked
      csvExport: false,
      pdfExport: false,
      apiAccess: false,
      timeFilters: false,
      formBranching: false,
      atRiskAlerts: false,
      whiteLabelForms: false,
      emailSupport: true,
      emailResponseTime: '72hr',
      liveChat: false,
      dedicatedManager: false,
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
    whopPlanId: 'plan_hnYnLn6egXRis',
    limits: {
      maxStudents: 1000,
      maxResponsesPerMonth: 1000,
      aiInsightsPerDay: 10,
      dataRetentionDays: 60,
      dashboardMetrics: ['consistency', 'popular', 'feedback', 'breakthrough', 'commitment', 'pathways'], // All 6
      csvExport: true,
      pdfExport: false,
      apiAccess: false,
      timeFilters: true,
      formBranching: true,
      atRiskAlerts: false,
      whiteLabelForms: false,
      emailSupport: true,
      emailResponseTime: '48hr',
      liveChat: false,
      dedicatedManager: false,
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
    whopPlanId: 'plan_OvGPVPXu6sarv',
    limits: {
      maxStudents: 2000,
      maxResponsesPerMonth: 10000,
      aiInsightsPerDay: 15,
      dataRetentionDays: 180,
      dashboardMetrics: ['consistency', 'popular', 'feedback', 'breakthrough', 'commitment', 'pathways'],
      csvExport: true,
      pdfExport: true,
      apiAccess: false,
      timeFilters: true,
      formBranching: true,
      atRiskAlerts: true,
      whiteLabelForms: true,
      emailSupport: true,
      emailResponseTime: '24hr',
      liveChat: true,
      dedicatedManager: false,
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
    whopPlanId: 'plan_YWwjHKXiWT6vq',
    limits: {
      maxStudents: 999999, // Unlimited
      maxResponsesPerMonth: 999999, // Unlimited
      aiInsightsPerDay: 20,
      dataRetentionDays: 365,
      dashboardMetrics: ['consistency', 'popular', 'feedback', 'breakthrough', 'commitment', 'pathways'],
      csvExport: true,
      pdfExport: true,
      apiAccess: true,
      timeFilters: true,
      formBranching: true,
      atRiskAlerts: true,
      whiteLabelForms: true,
      emailSupport: true,
      emailResponseTime: '2hr',
      liveChat: true,
      dedicatedManager: true,
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
 * Map old tier names to new ones
 */
function mapLegacyTierName(tierName: string): TierName {
  const mapping: Record<string, TierName> = {
    'atom': 'starter',
    'core': 'growth',
    'pulse': 'pro',
    'surge': 'scale',
    'quantum': 'scale',
  };
  return mapping[tierName] || (tierName as TierName);
}

/**
 * Get tier by name (handles legacy tier names)
 */
export function getTier(tierName: string): PricingTier {
  const mappedName = mapLegacyTierName(tierName);
  const tier = PRICING_TIERS[mappedName];
  
  if (!tier) {
    console.warn(`Unknown tier: ${tierName}, falling back to starter`);
    return PRICING_TIERS.starter;
  }
  
  return tier;
}

/**
 * Get all tiers (for pricing page)
 */
export function getAllTiers(): PricingTier[] {
  return Object.values(PRICING_TIERS);
}

/**
 * Check if a tier can access a specific dashboard metric
 */
export function canAccessMetric(tier: TierName, metricId: string): boolean {
  const tierData = getTier(tier);
  return tierData.limits.dashboardMetrics.includes(metricId);
}

/**
 * Check if a tier can perform an action
 */
export function canPerformAction(
  tier: TierName,
  action: 'csvExport' | 'pdfExport' | 'apiAccess' | 'timeFilters' | 'formBranching' | 'atRiskAlerts' | 'whiteLabelForms'
): boolean {
  const tierData = getTier(tier);
  return tierData.limits[action] || false;
}


