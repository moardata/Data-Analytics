/**
 * Pricing & Upgrade Page
 * Beautiful dark emerald design with neon glow effects
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { getAllTiers, type TierName } from '@/lib/pricing/tiers';

export const dynamic = 'force-dynamic';

const planEmojis: Record<TierName, string> = {
  atom: '⚛️',
  core: '🧭',
  pulse: '🚀',
  surge: '🏆',
  quantum: '💼',
};

function UpgradeContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [currentTier, setCurrentTier] = useState<TierName>('atom');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentTier();
  }, [clientId]);

  const fetchCurrentTier = async () => {
    try {
      const res = await fetch(`/api/usage/check?companyId=${clientId}`);
      const data = await res.json();
      setCurrentTier(data.tier || 'atom');
    } catch (error) {
      console.error('Error fetching tier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (tierName: TierName) => {
    if (tierName === 'atom') {
      alert('You\'re already on the free plan!');
      return;
    }

    if (tierName === currentTier) {
      alert('You\'re already on this plan!');
      return;
    }

    // Get the Whop plan ID for the selected tier
    const tier = tiers.find(t => t.name === tierName);
    if (!tier?.whopPlanId) {
      alert('Plan not available yet. Please contact support.');
      return;
    }

    // Redirect to Whop's plan purchase page
    const whopPlanUrl = `https://whop.com/checkout/${tier.whopPlanId}/`;
    window.open(whopPlanUrl, '_blank');
  };

  const tiers = getAllTiers();
  const isPopular = (tierName: TierName) => tierName === 'pulse';
  const isCurrentTier = (tierName: TierName) => tierName === currentTier;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-[#E1E4EA]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-[#F8FAFC] mb-4 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
            Unlock more features and higher limits for your analytics
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier) => {
            const highlight = isPopular(tier.name);
            const current = isCurrentTier(tier.name);
            const emoji = planEmojis[tier.name];

            return (
              <Card
                key={tier.name}
                className={cn(
                  'relative rounded-2xl overflow-hidden',
                  'border border-[#1a1a1a] bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f]',
                  'transition-all duration-300',
                  'shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]',
                  highlight && 'border-[#10B981]/40',
                  'hover:shadow-[0_0_30px_rgba(16,185,129,0.3),0_0_0_1px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]',
                  'hover:scale-[1.02]'
                )}
              >
                {/* Top gradient shine */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#10B981]/20 to-transparent" />
                
                {/* Glow overlay on hover */}
                <div className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
                  "bg-gradient-to-br from-[#10B981]/5 via-transparent to-transparent",
                  "group-hover:opacity-100"
                )} />

                <CardContent className="relative p-8">
                  {/* Header with icon and badge */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
                      <span className="text-3xl">{emoji}</span>
                    </div>
                    {highlight && (
                      <div className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        Popular
                      </div>
                    )}
                    {current && (
                      <div className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]">
                        Current
                      </div>
                    )}
                  </div>

                  {/* Plan name and price */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#F8FAFC] mb-2">{tier.displayName}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[#F8FAFC]">${tier.price}</span>
                      <span className="text-[#A1A1AA] text-base font-medium">/month</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3 mb-8 min-h-[200px]">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-[#D4D4D8] leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleUpgrade(tier.name)}
                    disabled={current}
                    className={cn(
                      'w-full h-12 rounded-xl font-semibold transition-all duration-300',
                      'border shadow-lg',
                      current
                        ? 'bg-[#1a1a1a] border-[#2a2a2a] text-[#71717A] cursor-not-allowed'
                        : highlight
                        ? 'bg-[#10B981] hover:bg-[#0E9F71] border-[#10B981] text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]'
                        : 'bg-[#0a0a0a] hover:bg-[#1a1a1a] border-[#10B981]/30 hover:border-[#10B981]/50 text-[#F8FAFC] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    )}
                  >
                    {current ? 'Current Plan' : tier.name === 'atom' ? 'Downgrade' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom info */}
        <div className="mt-16 text-center">
          <p className="text-[#71717A] text-sm">
            All plans include basic analytics and webhook integrations. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  );
}
