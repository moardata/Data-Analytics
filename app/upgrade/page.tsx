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
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 'default';
  
  const [currentTier, setCurrentTier] = useState<TierName>('atom');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentTier();
  }, [clientId]);

  const fetchCurrentTier = async () => {
    try {
      const res = await fetch('/api/usage/check');
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

    // For now, redirect to your Whop app's main page
    // TODO: Create actual products in Whop dashboard
    const whopAppUrl = 'https://whop.com/apps/app_qMCiZm0xUewsGe/';
    alert(`To upgrade to ${tier.displayName}, please contact support or visit your Whop dashboard to set up pricing plans.`);
    window.open(whopAppUrl, '_blank');
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
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-zinc-400 text-lg">
            Unlock more features and higher limits for your analytics
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const highlight = isPopular(tier.name);
            const current = isCurrentTier(tier.name);
            const emoji = planEmojis[tier.name];

            return (
              <Card
                key={tier.name}
                className={cn(
                  'relative rounded-2xl border border-[#2A2F36] bg-gradient-to-b from-[#16191F] to-[#121418]',
                  'transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5),inset_0_0_8px_rgba(255,255,255,0.05)]',
                  'hover:shadow-[0_0_25px_rgba(16,185,129,0.6),inset_0_0_12px_rgba(16,185,129,0.2)] hover:border-emerald-500 hover:scale-[1.02]'
                )}
              >
                {/* Neon border glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_70%)]" />
                </div>

                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl">{emoji}</div>
                    {highlight && (
                      <div className="rounded-full px-3 py-1 text-[12px] font-medium bg-emerald-900/30 border border-emerald-600 text-emerald-300">
                        Popular
                      </div>
                    )}
                    {current && (
                      <div className="rounded-full px-3 py-1 text-[12px] font-medium bg-blue-900/30 border border-blue-600 text-blue-300">
                        Current
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-white">{tier.displayName}</h3>
                  <p className="text-2xl font-bold text-emerald-400 mb-4">
                    ${tier.price}
                    <span className="text-zinc-500 text-sm font-normal">/month</span>
                  </p>

                  <ul className="space-y-2 text-sm text-zinc-400 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-[2px]">✔</span> {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(tier.name)}
                    disabled={current}
                    className={cn(
                      'w-full border text-white transition-all',
                      current
                        ? 'bg-[#2A2F36] border-[#2A2F36] cursor-not-allowed opacity-50'
                        : highlight
                        ? 'bg-emerald-700/40 hover:bg-emerald-700 border-emerald-600'
                        : 'bg-[#0B2C24]/40 hover:bg-[#0E3A2F]/60 border-[#17493A]'
                    )}
                  >
                    {current ? 'Current Plan' : tier.name === 'atom' ? 'Downgrade' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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
