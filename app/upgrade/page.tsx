/**
 * Pricing & Upgrade Page
 * Beautiful dark emerald design with neon glow effects
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { getAllTiers, type TierName } from '@/lib/pricing/tiers';
import { FeatureComparisonTable } from '@/components/FeatureComparisonTable';

export const dynamic = 'force-dynamic';

const planEmojis: Record<TierName, string> = {
  starter: '⚛️',
  growth: '🚀',
  pro: '🏆',
  scale: '💼',
};

function UpgradeContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [currentTier, setCurrentTier] = useState<TierName | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentTier();
  }, [clientId]);

  // Listen for checkout completion from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if message is from Whop
      if (event.origin.includes('whop.com')) {
        if (event.data?.type === 'checkout_complete' || event.data?.success) {
          console.log('✅ Checkout complete!');
          // Refresh page to update subscription
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchCurrentTier = async () => {
    try {
      console.log('🔍 Fetching tier for companyId:', clientId);
      const res = await fetch(`/api/usage/check?companyId=${clientId}`);
      const data = await res.json();
      console.log('📊 API Response:', data);
      console.log('🎯 Setting currentTier to:', data.tier || null);
      // Don't default to 'starter' - keep it null if no subscription
      setCurrentTier(data.tier || null);
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

    // Get the tier info
    const tier = tiers.find(t => t.name === tierName);
    if (!tier?.whopPlanId) {
      alert('Plan not available yet. Please contact support.');
      return;
    }

    // Map product IDs to actual plan IDs
    const planIdMap: Record<string, string> = {
      'prod_Tdu9YayfFDxhc': 'plan_Axr22QP0Sj86G',  // Starter $30
      'prod_UNx31yqmQcXOx': 'plan_IrOqGUheWuL1x',  // Growth $99.99
      'prod_03fZxoux0PVvW': 'plan_Jbp6KtLwdbZ0k',  // Pro $299
      'prod_QFtQEu91TO2yh': 'plan_ioOlKM9cTtESv',  // Scale $599
    };

    const planId = planIdMap[tier.whopPlanId];
    if (planId) {
      setSelectedPlan(planId);
    }
  };

  const tiers = getAllTiers();
  const isPopular = (tierName: TierName) => tierName === 'pro';
  const isCurrentTier = (tierName: TierName) => currentTier !== null && tierName === currentTier;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-8 mb-12 relative overflow-hidden">
          {/* Metallic sheen overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-[#F8FAFC] mb-4 tracking-tight">
              Choose Your Plan
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#10B981] rounded-full mx-auto mb-4"></div>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
              Start FREE for 7 days - See what's working in your course
            </p>
            {!loading && currentTier && (
              <div className="mt-4">
                <Badge className="bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] px-4 py-1.5">
                  Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                </Badge>
              </div>
            )}
          </div>
        </div>

            {/* Feature Comparison Table */}
            <div className="mb-16">
              <FeatureComparisonTable onSelectTier={handleUpgrade} currentTier={currentTier} />
            </div>

            {/* FAQ Section */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#F8FAFC] mb-2">
                  Frequently Asked Questions
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-[#10B981] to-[#10B981]/50 rounded-full mx-auto"></div>
              </div>
              <div className="max-w-3xl mx-auto space-y-4">
                {[
                  {
                    question: "Do I get a free trial?",
                    answer: "Yes! The Starter plan includes a 7-day free trial. Credit card required to start, but you won't be charged for 7 days. After the trial, your subscription automatically continues at $30/month."
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
                    className="relative overflow-hidden rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-6 transition-all duration-300 hover:border-[#10B981]/30 hover:shadow-lg hover:shadow-[#10B981]/10 group"
                  >
                    {/* Metallic sheen overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3 group-hover:text-[#10B981] transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-[#A1A1AA] text-sm leading-relaxed group-hover:text-[#E2E8F0] transition-colors">
                        {faq.answer}
                      </p>
                    </div>
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

      {/* Embedded Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-[#1a1a1a]/50 rounded-xl shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Embedded Checkout */}
            <div className="min-h-[500px]">
              <WhopCheckoutEmbed
                planId={selectedPlan}
                theme="dark"
                onComplete={(planId, receiptId) => {
                  setTimeout(() => window.location.reload(), 1000);
                }}
                skipRedirect={true}
                themeOptions={{ accentColor: 'green' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UpgradePage() {
  return <UpgradeContent />;
}
