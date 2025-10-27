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

            {/* FAQ Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-[#F8FAFC] mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="max-w-3xl mx-auto space-y-4">
                {[
                  {
                    question: "Do I get a free trial?",
                    answer: "Yes! All plans include a 7-day free trial. No credit card required to start."
                  },
                  {
                    question: "Can I change plans later?",
                    answer: "Absolutely! You can upgrade or downgrade your plan anytime. Changes take effect immediately."
                  },
                  {
                    question: "What happens if I reach my limits?",
                    answer: "You'll receive a notification when approaching your limits. You can either upgrade your plan or wait until next month when limits reset."
                  },
                  {
                    question: "Can I cancel anytime?",
                    answer: "Yes! Cancel anytime with no penalties. Your data remains accessible for 30 days after cancellation."
                  },
                  {
                    question: "Which plan should I choose?",
                    answer: "Start with the Starter plan if you're just beginning. Upgrade to Growth when you hit 100+ students. Pro and Scale are for larger communities with advanced needs."
                  },
                ].map((faq, index) => (
                  <div 
                    key={index}
                    className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-6 transition-all duration-300 hover:border-[#10B981]/30"
                  >
                    <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
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
