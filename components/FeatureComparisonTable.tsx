/**
 * Feature Comparison Table
 * Shows side-by-side comparison of all pricing tiers
 */

'use client';

import { Check, X, Zap } from 'lucide-react';
import { getAllTiers, type TierName } from '@/lib/pricing/tiers';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface FeatureRow {
  label: string;
  starter: boolean | string | number;
  growth: boolean | string | number;
  pro: boolean | string | number;
  scale: boolean | string | number;
}

interface FeatureComparisonTableProps {
  onSelectTier: (tierName: TierName) => void;
  currentTier?: TierName;
}

export function FeatureComparisonTable({ onSelectTier, currentTier }: FeatureComparisonTableProps) {
  const tiers = getAllTiers();

  const features: FeatureRow[] = [
    // Pricing
    { label: 'Price', starter: '$30/mo', growth: '$99/mo', pro: '$299/mo', scale: '$599/mo' },
    
    // Core Limits
    { label: 'Students', starter: '100', growth: '1,000', pro: '2,000', scale: 'Unlimited' },
    { label: 'AI Insights/Day', starter: '5', growth: '10', pro: '15', scale: '20' },
    { label: 'Responses/Month', starter: '100', growth: '1,000', pro: '10,000', scale: 'Unlimited' },
    
    // Features
    { label: 'Dashboard Metrics', starter: '3 of 6', growth: 'All 6', pro: 'All 6', scale: 'All 6' },
    { label: 'CSV Export', starter: false, growth: true, pro: true, scale: true },
    { label: 'PDF Reports', starter: false, growth: false, pro: true, scale: true },
    { label: 'API Access', starter: false, growth: false, pro: false, scale: true },
  ];

  const renderCell = (value: boolean | string | number, isHighlight: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-4 h-4 text-[#10B981] mx-auto" />
      ) : (
        <X className="w-4 h-4 text-[#3a3a3a] mx-auto" />
      );
    }
    return (
      <span className={cn(
        "text-xs font-medium",
        isHighlight ? "text-[#F8FAFC]" : "text-[#A1A1AA]"
      )}>
        {value}
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Compact table */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-5 gap-3 p-6 border-b border-[#1a1a1a] bg-[#0a0a0a]/70">
            <div className="text-xs font-bold uppercase text-[#71717A] tracking-wide">Feature</div>
            {tiers.map((tier) => (
              <div key={tier.name} className="text-center space-y-2">
                <div>
                  <div className="text-sm font-bold text-[#F8FAFC]">{tier.displayName}</div>
                  {tier.name === 'pro' && (
                    <div className="mt-0.5 text-[10px] font-semibold text-[#10B981]">POPULAR</div>
                  )}
                  {tier.trialDays && (
                    <div className="mt-0.5 text-[10px] font-semibold text-[#10B981]">FREE TRIAL</div>
                  )}
                </div>
                <Button
                  onClick={() => onSelectTier(tier.name)}
                  disabled={currentTier === tier.name}
                  className={cn(
                    'w-full h-9 text-xs font-semibold transition-all',
                    currentTier === tier.name
                      ? 'bg-[#1a1a1a] border-[#2a2a2a] text-[#71717A] cursor-not-allowed'
                      : tier.trialDays || tier.name === 'pro'
                      ? 'bg-[#10B981] hover:bg-[#0E9F71] border-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-[#0a0a0a] hover:bg-[#1a1a1a] border-[#10B981]/30 hover:border-[#10B981]/50 text-[#F8FAFC]'
                  )}
                >
                  {currentTier === tier.name ? 'Current' : tier.trialDays ? 'Start FREE' : 'Select'}
                </Button>
              </div>
            ))}
          </div>

          {/* Feature Rows - More Compact */}
          {features.map((feature, idx) => (
            <div
              key={feature.label}
              className={cn(
                "grid grid-cols-5 gap-3 px-4 py-2.5 items-center transition-colors",
                idx % 2 === 0 ? "bg-[#0a0a0a]/30" : "bg-transparent",
                "hover:bg-[#0a0a0a]/50",
                idx !== features.length - 1 && "border-b border-[#1a1a1a]/30"
              )}
            >
              <div className="text-xs font-medium text-[#A1A1AA]">{feature.label}</div>
              <div className="text-center">{renderCell(feature.starter)}</div>
              <div className="text-center">{renderCell(feature.growth)}</div>
              <div className="text-center bg-[#10B981]/5 rounded-lg py-1">
                {renderCell(feature.pro, true)}
              </div>
              <div className="text-center">{renderCell(feature.scale)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

