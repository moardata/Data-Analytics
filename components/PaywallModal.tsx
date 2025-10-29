/**
 * Paywall Modal Component
 * Shows Whop's embedded checkout when user needs to subscribe
 * Handles 7-day free trial for first-time users
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string; // What action triggered the paywall
}

export function PaywallModal({ isOpen, onClose, reason }: PaywallModalProps) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [eligibleForTrial, setEligibleForTrial] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is eligible for free trial
  useEffect(() => {
    if (!isOpen) return;
    
    const checkTrialEligibility = async () => {
      try {
        const response = await fetch(`/api/subscription/check-trial?companyId=${companyId}`);
        const data = await response.json();
        setEligibleForTrial(data.eligibleForTrial);
      } catch (error) {
        console.error('Error checking trial eligibility:', error);
        setEligibleForTrial(false);
      } finally {
        setLoading(false);
      }
    };

    checkTrialEligibility();
  }, [isOpen, companyId]);

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

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (productId: string) => {
    // Map product IDs to actual plan IDs
    const planIdMap: Record<string, string> = {
      'prod_Tdu9YayfFDxhc': 'plan_Axr22QP0Sj86G',  // Starter $30
      'prod_UNx31yqmQcXOx': 'plan_IrOqGUheWuL1x',  // Growth $99.99
      'prod_03fZxoux0PVvW': 'plan_Jbp6KtLwdbZ0k',  // Pro $299
      'prod_QFtQEu91TO2yh': 'plan_ioOlKM9cTtESv',  // Scale $599
    };
    
    const planId = planIdMap[productId];
    if (planId) {
      setSelectedPlan(planId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-2xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 border-b border-[#2a2a2a]">
          <h2 className="text-3xl font-bold text-white mb-2">
            {eligibleForTrial ? '🎉 Start Your Free Trial' : '🚀 Upgrade Required'}
          </h2>
          <p className="text-gray-400">
            {reason || 'This feature requires an active subscription'}
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        ) : selectedPlan ? (
          /* Show embedded checkout for selected plan */
          <div className="p-0">
            <div data-whop-checkout-plan-id={selectedPlan} data-whop-checkout-theme="dark"></div>
          </div>
        ) : (
          <div className="p-8">
            {eligibleForTrial ? (
              /* Free Trial Offer */
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Starter Plan</h3>
                      <p className="text-emerald-400 font-semibold">7 Days Free, then $30/month</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">$0</div>
                      <div className="text-sm text-gray-400">for 7 days</div>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 text-sm text-gray-300 mb-6">
                    <li className="flex items-center">
                      <span className="text-emerald-400 mr-2">✓</span>
                      Up to 100 students
                    </li>
                    <li className="flex items-center">
                      <span className="text-emerald-400 mr-2">✓</span>
                      5 AI insights per day
                    </li>
                    <li className="flex items-center">
                      <span className="text-emerald-400 mr-2">✓</span>
                      Unlimited custom forms
                    </li>
                    <li className="flex items-center">
                      <span className="text-emerald-400 mr-2">✓</span>
                      3 core dashboard metrics
                    </li>
                    <li className="flex items-center">
                      <span className="text-emerald-400 mr-2">✓</span>
                      14-day data retention
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSelectPlan('prod_Tdu9YayfFDxhc')}
                    className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/30"
                  >
                    Start 7-Day Free Trial
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Cancel anytime during trial • No charge until day 8
                  </p>
                </div>

                {/* Other plans */}
                <div className="pt-4 border-t border-[#2a2a2a]">
                  <p className="text-sm text-gray-400 mb-4">Or choose a different plan:</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleSelectPlan('prod_UNx31yqmQcXOx')}
                      className="p-4 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] rounded-lg transition-colors text-left"
                    >
                      <div className="font-semibold text-white text-sm">Growth</div>
                      <div className="text-emerald-400 text-lg font-bold">$99.99</div>
                      <div className="text-xs text-gray-500">/month</div>
                    </button>
                    
                    <button
                      onClick={() => handleSelectPlan('prod_03fZxoux0PVvW')}
                      className="p-4 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] rounded-lg transition-colors text-left"
                    >
                      <div className="font-semibold text-white text-sm">Pro</div>
                      <div className="text-emerald-400 text-lg font-bold">$299</div>
                      <div className="text-xs text-gray-500">/month</div>
                    </button>
                    
                    <button
                      onClick={() => handleSelectPlan('prod_QFtQEu91TO2yh')}
                      className="p-4 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] rounded-lg transition-colors text-left"
                    >
                      <div className="font-semibold text-white text-sm">Scale</div>
                      <div className="text-emerald-400 text-lg font-bold">$599</div>
                      <div className="text-xs text-gray-500">/month</div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* No Free Trial - Show Plans */
              <div className="space-y-4">
                <p className="text-gray-400 mb-6">
                  You've already used your free trial. Choose a plan to continue:
                </p>
                
                <div className="space-y-3">
                  {[
                    { name: 'Starter', price: '$30', planId: 'prod_Tdu9YayfFDxhc', features: '100 students • 5 AI insights/day' },
                    { name: 'Growth', price: '$99.99', planId: 'prod_UNx31yqmQcXOx', features: '1,000 students • 10 AI insights/day', popular: true },
                    { name: 'Pro', price: '$299', planId: 'prod_03fZxoux0PVvW', features: '2,000 students • 15 AI insights/day' },
                    { name: 'Scale', price: '$599', planId: 'prod_QFtQEu91TO2yh', features: 'Unlimited • 20 AI insights/day' },
                  ].map((plan) => (
                    <button
                      key={plan.planId}
                      onClick={() => handleSelectPlan(plan.planId)}
                      className={`w-full p-5 border rounded-xl transition-all text-left ${
                        plan.popular
                          ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/50 hover:border-emerald-500'
                          : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            {plan.popular && (
                              <span className="px-2 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/20 rounded-full">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{plan.features}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{plan.price}</div>
                          <div className="text-xs text-gray-500">/month</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

