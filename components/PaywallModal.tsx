/**
 * Paywall Modal Component - Purple/Blue Theme
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      {/* Glow effect background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-full blur-3xl opacity-50" />
      </div>
      
      <div className="relative w-full max-w-lg mx-auto">
        {/* Outer glow border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-2xl blur opacity-75 animate-pulse" />
        
        {/* Main modal */}
        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] border border-purple-500/30 rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30"
          >
            <X size={18} />
          </button>

          {/* Header with gradient */}
          <div className="px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {eligibleForTrial ? 'Start Your Free Trial' : 'Upgrade Required'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {reason || 'This feature requires an active subscription'}
            </p>
          </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-purple-500/50" />
            <p className="mt-3 text-sm text-purple-300">Loading your options...</p>
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
          <div className="p-5 overflow-y-auto">
            {eligibleForTrial ? (
              /* Free Trial Offer - ONLY Starter Plan */
              <div className="space-y-3">
                {/* Glow effect for the card */}
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-xl blur opacity-30" />
                  <div className="relative bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-emerald-500/15 border border-purple-500/40 rounded-xl p-4 shadow-xl">
                    <div className="flex items-center justify-center w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 rounded-full shadow-lg shadow-purple-500/50">
                      <span className="text-2xl">🚀</span>
                    </div>
                    
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent text-center mb-2">Starter Plan</h3>
                    <p className="text-center mb-3">
                      <span className="text-purple-300 text-base font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">7 Days FREE</span>
                      <span className="text-gray-400 text-xs block mt-0.5">then $30/month</span>
                    </p>
                  
                    <ul className="space-y-1.5 text-xs text-gray-200 mb-3">
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 text-purple-400 mr-2 drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]" />
                        <span>Up to 100 students</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 text-purple-400 mr-2 drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]" />
                        <span>5 AI insights per day</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-400 mr-2 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
                        <span>Unlimited custom forms</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-400 mr-2 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
                        <span>Full analytics dashboard</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mr-2 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                        <span>14-day data retention</span>
                      </li>
                    </ul>

                    <button
                      onClick={() => handleSelectPlan('prod_Tdu9YayfFDxhc')}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 hover:from-purple-500 hover:via-blue-500 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02]"
                    >
                      Start 7-Day Free Trial
                    </button>
                    
                    <p className="text-[10px] text-gray-400 text-center mt-2 leading-relaxed">
                      No credit card charge for 7 days • Cancel anytime<br/>Automatically renews at $30/month
                    </p>
                  </div>
                </div>

                {/* Link to see other plans */}
                <div className="text-center">
                  <a
                    href="/upgrade"
                    className="text-xs text-gray-400 hover:text-purple-400 transition-all duration-200 underline hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]"
                  >
                    View all plans and pricing
                  </a>
                </div>
              </div>
            ) : (
              /* No Free Trial - Show Plans */
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-3">
                  Choose a plan to continue:
                </p>
                
                <div className="space-y-2">
                  {[
                    { name: 'Starter', price: '$30', planId: 'prod_Tdu9YayfFDxhc', features: '100 students • 5 AI insights/day' },
                    { name: 'Growth', price: '$99.99', planId: 'prod_UNx31yqmQcXOx', features: '1,000 students • 10 AI insights/day', popular: true },
                    { name: 'Pro', price: '$299', planId: 'prod_03fZxoux0PVvW', features: '2,000 students • 15 AI insights/day' },
                    { name: 'Scale', price: '$599', planId: 'prod_QFtQEu91TO2yh', features: 'Unlimited • 20 AI insights/day' },
                  ].map((plan) => (
                    <button
                      key={plan.planId}
                      onClick={() => handleSelectPlan(plan.planId)}
                      className={`w-full p-3.5 border rounded-xl transition-all duration-200 text-left hover:scale-[1.01] ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500/20 via-blue-500/15 to-emerald-500/20 border-purple-500/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30'
                          : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-purple-500/30 hover:bg-[#1f1f1f]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base font-bold ${plan.popular ? 'bg-gradient-to-r from-purple-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent' : 'text-white'}`}>{plan.name}</h3>
                            {plan.popular && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 bg-purple-500/30 rounded-full border border-purple-500/50 shadow-lg shadow-purple-500/20">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{plan.features}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${plan.popular ? 'text-purple-300' : 'text-white'}`}>{plan.price}</div>
                          <div className="text-[10px] text-gray-500">/month</div>
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
    </div>
  );
}

