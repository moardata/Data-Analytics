/**
 * Paywall Modal Component
 * Shows Whop's embedded checkout when user needs to subscribe
 * Handles 7-day free trial for first-time users
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { X, CheckCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg mx-auto bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-[#2a2a2a]">
          <h2 className="text-2xl font-bold text-white mb-2">
            {eligibleForTrial ? '🎉 Start Your Free Trial' : '🚀 Upgrade Required'}
          </h2>
          <p className="text-sm text-gray-400">
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
          <div className="flex-1 overflow-y-auto">
            <WhopCheckoutEmbed
              planId={selectedPlan}
              theme="dark"
              onComplete={(planId, receiptId) => {
                console.log('✅ Checkout complete!', { planId, receiptId });
                setTimeout(() => window.location.reload(), 1000);
              }}
              skipRedirect={true}
              themeOptions={{ accentColor: 'green' }}
            />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto">
            {eligibleForTrial ? (
              /* Free Trial Offer - ONLY Starter Plan */
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl p-5">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
                    <span className="text-3xl">🚀</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white text-center mb-2">Starter Plan</h3>
                  <p className="text-center mb-3">
                    <span className="text-emerald-400 text-lg font-bold">7 Days FREE</span>
                    <span className="text-gray-400 text-xs block mt-1">then $30/month</span>
                  </p>
                  
                  <ul className="space-y-2 text-xs text-gray-300 mb-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                      <span>Up to 100 students</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                      <span>5 AI insights per day</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                      <span>Unlimited custom forms</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                      <span>Full analytics dashboard</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                      <span>14-day data retention</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSelectPlan('prod_Tdu9YayfFDxhc')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/30"
                  >
                    🎉 Start 7-Day Free Trial
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    No credit card charge for 7 days • Cancel anytime • Automatically renews at $30/month
                  </p>
                </div>

                {/* Link to see other plans */}
                <div className="text-center">
                  <a
                    href="/upgrade"
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors underline"
                  >
                    View all plans and pricing
                  </a>
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

