/**
 * Pricing Tiers for Creator Analytics
 * Based on Whop group sizes and realistic creator needs
 */

export type TierName = 'atom' | 'core' | 'pulse' | 'surge';

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
  atom: {
    name: 'atom',
    displayName: 'Starter',
    price: 30,
    currency: 'USD',
    trialDays: 7, // 7-day free trial
    whopPlanId: 'prod_Tdu9YayfFDxhc',
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

  core: {
    name: 'core',
    displayName: 'Growth',
    price: 99,
    currency: 'USD',
    whopPlanId: 'prod_UNx31yqmQcXOx',
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

  pulse: {
    name: 'pulse',
    displayName: 'Pro',
    price: 299,
    currency: 'USD',
    whopPlanId: 'prod_03fZxoux0PVvW',
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

  surge: {
    name: 'surge',
    displayName: 'Scale',
    price: 599,
    currency: 'USD',
    whopPlanId: 'prod_QFtQEu91TO2yh',
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
 * Get tier by name
 */
export function getTier(tierName: TierName): PricingTier {
  return PRICING_TIERS[tierName] || PRICING_TIERS.atom;
}

/**
 * Get all tiers (for pricing page)
 */
export function getAllTiers(): PricingTier[] {
  return Object.values(PRICING_TIERS);
}

/**
 * Check if a tier can access a specific dashboard metric
 * 
 * @param tier - The user's subscription tier
 * @param metricId - The metric to check access for
 * @param companyId - Optional company ID for dev bypass (client-side)
 */
export function canAccessMetric(tier: TierName, metricId: string, companyId?: string): boolean {
  // DEV BYPASS: Check for dev company IDs (works on both client and server)
  const DEV_COMPANY_IDS = ['biz_3GYHNPbGkZCEky']; // Only your dev company
  if (companyId && DEV_COMPANY_IDS.includes(companyId)) {
    return true;
  }
  
  // DEV BYPASS: Always allow in 'surge' tier (highest tier unlocks everything)
  if (tier === 'surge') {
    return true;
  }
  
  // DEV BYPASS: Server-side environment check
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_BYPASS === 'true') {
      return true;
    }
  }
  
  const tierData = getTier(tier);
  return tierData.limits.dashboardMetrics.includes(metricId);
}

/**
 * Check if a tier can perform an action
 * 
 * @param tier - The user's subscription tier
 * @param action - The action to check permission for
 * @param companyId - Optional company ID for dev bypass (client-side)
 */
export function canPerformAction(
  tier: TierName,
  action: 'csvExport' | 'pdfExport' | 'apiAccess' | 'timeFilters' | 'formBranching' | 'atRiskAlerts' | 'whiteLabelForms',
  companyId?: string
): boolean {
  // DEV BYPASS: Check for dev company IDs (works on both client and server)
  const DEV_COMPANY_IDS = ['biz_3GYHNPbGkZCEky']; // Only your dev company
  if (companyId && DEV_COMPANY_IDS.includes(companyId)) {
    return true;
  }
  
  // DEV BYPASS: Always allow in 'surge' tier (highest tier unlocks everything)
  if (tier === 'surge') {
    return true;
  }
  
  // DEV BYPASS: Server-side environment check
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_BYPASS === 'true') {
      return true;
    }
  }
  
  const tierData = getTier(tier);
  return tierData.limits[action] || false;
}
