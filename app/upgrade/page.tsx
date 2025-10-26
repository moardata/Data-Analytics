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
import { FeatureComparisonTable } from '@/components/FeatureComparisonTable';

export const dynamic = 'force-dynamic';

const planEmojis: Record<TierName, string> = {
  atom: '⚛️',
  core: '🚀',
  pulse: '🏆',
  surge: '💼',
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-[#F8FAFC] mb-4 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
            Start FREE for 7 days - See what's working in your course
          </p>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16">
          <FeatureComparisonTable onSelectTier={handleUpgrade} currentTier={currentTier} />
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
