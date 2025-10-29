/**
 * Feature Comparison Table
 * Shows side-by-side comparison of all pricing tiers
 */

'use client';

import { Check, X, Zap, HelpCircle } from 'lucide-react';
import { getAllTiers, type TierName } from '@/lib/pricing/tiers';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface FeatureRow {
  label: string;
  tooltip?: string;
  atom: boolean | string | number;
  core: boolean | string | number;
  pulse: boolean | string | number;
  surge: boolean | string | number;
}

interface FeatureComparisonTableProps {
  onSelectTier: (tierName: TierName) => void;
  currentTier?: TierName;
}

export function FeatureComparisonTable({ onSelectTier, currentTier }: FeatureComparisonTableProps) {
  const tiers = getAllTiers();

  const features: FeatureRow[] = [
    // Pricing
    { label: 'Price', atom: '$30/mo', core: '$99/mo', pulse: '$299/mo', surge: '$599/mo' },
    
    // Core Limits
    { 
      label: 'Students', 
      tooltip: 'The number of students in your community that will be tracked and analysed by AI at one time.',
      atom: '100', 
      core: '1,000', 
      pulse: '2,000', 
      surge: 'Unlimited' 
    },
    { 
      label: 'AI Insights/Day', 
      tooltip: 'The number of curated AI insights that you can generate daily.',
      atom: '5', 
      core: '10', 
      pulse: '15', 
      surge: '20' 
    },
    { 
      label: 'Responses/Month', 
      tooltip: 'The number of survey responses you can receive per month. These are automatically analysed by AI to give you deeper insights.',
      atom: '250', 
      core: '2,500', 
      pulse: '10,000', 
      surge: 'Unlimited' 
    },
    
    // Features
    { label: 'Dashboard Metrics', atom: '3 of 6', core: 'All 6', pulse: 'All 6', surge: 'All 6' },
    { label: 'CSV Export', atom: false, core: true, pulse: true, surge: true },
    { label: 'PDF Reports', atom: false, core: false, pulse: true, surge: true },
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
              <div key={tier.name} className="text-center space-y-2 flex flex-col h-full">
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#F8FAFC]">{tier.displayName}</div>
                {tier.name === 'pulse' && (
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
                    'w-full h-9 text-xs font-semibold transition-all duration-300',
                    currentTier === tier.name
                      ? 'bg-[#1a1a1a] border-[#2a2a2a] text-[#71717A] cursor-not-allowed'
                      : 'bg-[#10B981]/20 hover:bg-[#10B981]/30 border-[#10B981]/40 hover:border-[#10B981]/60 text-white backdrop-blur-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]'
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
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[#A1A1AA]">{feature.label}</span>
                {feature.tooltip && (
                  <div className="group/info relative">
                    <HelpCircle className="h-3.5 w-3.5 text-[#71717A] hover:text-[#10B981] cursor-help transition-colors flex-shrink-0" />
                    <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                      <p className="text-xs text-[#E5E7EB] leading-relaxed">{feature.tooltip}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center">{renderCell(feature.atom)}</div>
              <div className="text-center">{renderCell(feature.core)}</div>
              <div className="text-center bg-[#10B981]/5 rounded-lg py-1">
                {renderCell(feature.pulse, true)}
              </div>
              <div className="text-center">{renderCell(feature.surge)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

