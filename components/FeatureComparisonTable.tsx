/**
 * Feature Comparison Table
 * Shows side-by-side comparison of all pricing tiers
 */

'use client';

import { Check, X } from 'lucide-react';
import { getAllTiers, type TierName } from '@/lib/pricing/tiers';
import { cn } from '@/lib/utils/cn';

interface FeatureRow {
  label: string;
  starter: boolean | string | number;
  growth: boolean | string | number;
  pro: boolean | string | number;
  scale: boolean | string | number;
}

export function FeatureComparisonTable() {
  const tiers = getAllTiers();

  const features: FeatureRow[] = [
    // Pricing
    { label: 'Monthly Price', starter: '$30', growth: '$99', pro: '$299', scale: '$599' },
    { label: 'Free Trial', starter: '7 days', growth: '—', pro: '—', scale: '—' },
    
    // Limits
    { label: 'Students', starter: '100', growth: '1,000', pro: '2,000', scale: 'Unlimited' },
    { label: 'AI Insights/Day', starter: '5', growth: '10', pro: '15', scale: '20+' },
    { label: 'Responses/Month', starter: '100', growth: '1,000', pro: '10,000', scale: 'Unlimited' },
    { label: 'Data Retention', starter: '14 days', growth: '60 days', pro: '180 days', scale: '365 days' },
    
    // Dashboard
    { label: 'Dashboard Metrics', starter: '3 of 6', growth: 'All 6', pro: 'All 6', scale: 'All 6' },
    { label: 'Time Filters', starter: false, growth: true, pro: true, scale: true },
    { label: 'At-Risk Alerts', starter: false, growth: false, pro: true, scale: true },
    
    // Forms
    { label: 'Custom Forms', starter: 'Unlimited', growth: 'Unlimited', pro: 'Unlimited', scale: 'Unlimited' },
    { label: 'Form Branching', starter: false, growth: true, pro: true, scale: true },
    { label: 'White-Label Forms', starter: false, growth: false, pro: true, scale: true },
    
    // Exports
    { label: 'CSV Export', starter: false, growth: true, pro: true, scale: true },
    { label: 'PDF Reports', starter: false, growth: false, pro: true, scale: true },
    { label: 'API Access', starter: false, growth: false, pro: false, scale: true },
    
    // Support
    { label: 'Email Support', starter: '72hr', growth: '48hr', pro: '24hr', scale: '2hr SLA' },
    { label: 'Live Chat', starter: false, growth: false, pro: true, scale: true },
    { label: 'Success Manager', starter: false, growth: false, pro: false, scale: true },
  ];

  const renderCell = (value: boolean | string | number, isHighlight: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-[#10B981] mx-auto" />
      ) : (
        <X className="w-5 h-5 text-[#71717A] mx-auto" />
      );
    }
    return (
      <span className={cn(
        "text-sm font-medium",
        isHighlight ? "text-[#F8FAFC]" : "text-[#A1A1AA]"
      )}>
        {value}
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-5 gap-4 mb-2">
          <div className="text-sm font-semibold text-[#A1A1AA]">Features</div>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "text-center p-4 rounded-t-2xl",
                tier.name === 'pro' && "bg-[#10B981]/10 border-2 border-[#10B981]/30 border-b-0"
              )}
            >
              <div className="text-lg font-bold text-[#F8FAFC]">{tier.displayName}</div>
              {tier.name === 'pro' && (
                <div className="mt-1 text-xs font-semibold text-[#10B981]">Most Popular</div>
              )}
              {tier.trialDays && (
                <div className="mt-1 text-xs font-semibold text-[#10B981]">{tier.trialDays}-day FREE trial</div>
              )}
            </div>
          ))}
        </div>

        {/* Feature Rows */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] overflow-hidden">
          {features.map((feature, idx) => (
            <div
              key={feature.label}
              className={cn(
                "grid grid-cols-5 gap-4 p-4 items-center",
                idx % 2 === 0 ? "bg-[#0a0a0a]/50" : "bg-transparent",
                idx !== features.length - 1 && "border-b border-[#1a1a1a]/50"
              )}
            >
              <div className="text-sm font-medium text-[#D4D4D8]">{feature.label}</div>
              <div className="text-center p-2 rounded-lg">
                {renderCell(feature.starter)}
              </div>
              <div className="text-center p-2 rounded-lg">
                {renderCell(feature.growth)}
              </div>
              <div className="text-center p-2 rounded-lg bg-[#10B981]/5">
                {renderCell(feature.pro, true)}
              </div>
              <div className="text-center p-2 rounded-lg">
                {renderCell(feature.scale)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

