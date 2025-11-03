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
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

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
          // Refresh subscription from Whop API
          handleRefreshSubscription();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Manually refresh subscription from Whop
  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    setRefreshMessage('');
    
    console.log('🔄 [PaywallModal] Refreshing subscription for companyId:', companyId);
    
    try {
      if (!companyId) {
        setRefreshMessage('❌ Company ID is missing. Please refresh the page.');
        return;
      }

      const response = await fetch('/api/subscription/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      
      console.log('📡 [PaywallModal] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [PaywallModal] API error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setRefreshMessage(`❌ ${errorData.error || 'Failed to check subscription'}`);
        } catch {
          setRefreshMessage(`❌ API error (${response.status}): ${errorText.substring(0, 100)}`);
        }
        return;
      }
      
      const data = await response.json();
      console.log('📦 [PaywallModal] Refresh response:', data);
      
      if (data.success) {
        if (data.upgraded) {
          setRefreshMessage('🎉 Subscription activated! Reloading...');
          setTimeout(() => window.location.reload(), 1500);
        } else if (data.currentTier && data.currentTier !== 'none') {
          setRefreshMessage('✅ Subscription verified! Reloading...');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setRefreshMessage('ℹ️ No active subscription found yet. Please complete your purchase first.');
        }
      } else {
        setRefreshMessage('❌ ' + (data.error || 'Failed to refresh subscription'));
      }
    } catch (error) {
      console.error('❌ [PaywallModal] Refresh error:', error);
      console.error('❌ [PaywallModal] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        companyId,
      });
      
      // Show more helpful error message
      const errorMessage = error instanceof Error 
        ? `Failed: ${error.message}` 
        : 'Failed to check subscription. Please try again.';
      setRefreshMessage(`❌ ${errorMessage}`);
    } finally {
      setRefreshing(false);
    }
  };

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    // Use plan IDs directly
    setSelectedPlan(planId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg mx-auto">
        {/* Main modal */}
        <div className="relative bg-[#0f0f0f] border border-[#1a1a1a]/70 rounded-lg shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="px-6 py-5 border-b border-[#1a1a1a]/70">
            <h2 className="text-lg font-semibold text-[#F8FAFC]">
              {eligibleForTrial ? 'Start Your Free Trial' : 'Upgrade Required'}
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-1">
              {reason || 'This feature requires an active subscription'}
            </p>
          </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#A1A1AA] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-[#A1A1AA]">Loading...</p>
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
                <div className="bg-[#1a1a1a] border border-[#1a1a1a]/70 rounded-lg p-5">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full">
                    <span className="text-xl">🚀</span>
                  </div>
                  
                  <h3 className="text-base font-semibold text-[#F8FAFC] text-center mb-2">Starter Plan</h3>
                  <p className="text-center mb-4">
                    <span className="text-[#8B5CF6] text-sm font-semibold">7 Days FREE</span>
                    <span className="text-[#A1A1AA] text-xs block mt-0.5">then $30/month</span>
                  </p>
                  
                  <ul className="space-y-2 text-sm text-[#A1A1AA] mb-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 text-[#8B5CF6] mr-2 flex-shrink-0" />
                      <span>Up to 100 students</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 text-[#8B5CF6] mr-2 flex-shrink-0" />
                      <span>5 AI insights per day</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 text-[#3B82F6] mr-2 flex-shrink-0" />
                      <span>Unlimited custom forms</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 text-[#3B82F6] mr-2 flex-shrink-0" />
                      <span>Full analytics dashboard</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 text-[#10B981] mr-2 flex-shrink-0" />
                      <span>14-day data retention</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSelectPlan('plan_Axr22QP0Sj86G')}
                    className="w-full py-2.5 px-4 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-white backdrop-blur-sm transition-all rounded-lg"
                  >
                    Start 7-Day Free Trial
                  </button>
                    
                  <p className="text-[11px] text-[#71717A] text-center mt-3 leading-relaxed">
                    No credit card charge for 7 days • Cancel anytime<br/>Automatically renews at $30/month
                  </p>
                </div>

                {/* Link to see other plans */}
                <div className="text-center">
                  <a
                    href="/upgrade"
                    className="text-xs text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors underline"
                  >
                    View all plans and pricing
                  </a>
                </div>

                {/* Just Subscribed Button */}
                <div className="border-t border-[#1a1a1a]/70 pt-4 mt-4">
                  <button
                    onClick={handleRefreshSubscription}
                    disabled={refreshing}
                    className="w-full py-2 px-4 text-sm bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {refreshing ? '⏳ Checking...' : '✅ Just Subscribed? Click to Refresh'}
                  </button>
                  {refreshMessage && (
                    <p className="text-xs text-center mt-2 text-[#A1A1AA]">{refreshMessage}</p>
                  )}
                </div>
              </div>
            ) : (
              /* No Free Trial - Show Plans */
              <div className="space-y-4">
                <p className="text-sm text-[#A1A1AA]">
                  Choose a plan to continue:
                </p>
                
                <div className="space-y-2">
                  {[
                    { name: 'Starter', price: '$30', planId: 'plan_Axr22QP0Sj86G', features: '100 students • 5 AI insights/day' },
                    { name: 'Growth', price: '$99.99', planId: 'plan_IrOqGUheWuL1x', features: '1,000 students • 10 AI insights/day', popular: true },
                    { name: 'Pro', price: '$299', planId: 'plan_Jbp6KtLwdbZ0k', features: '2,000 students • 15 AI insights/day' },
                    { name: 'Scale', price: '$599', planId: 'plan_ioOlKM9cTtESv', features: 'Unlimited • 20 AI insights/day' },
                  ].map((plan) => (
                    <button
                      key={plan.planId}
                      onClick={() => handleSelectPlan(plan.planId)}
                      className={`w-full p-4 border rounded-lg transition-all text-left ${
                        plan.popular
                          ? 'bg-[#1a1a1a] border-[#8B5CF6]/30 hover:border-[#8B5CF6]/50 hover:bg-[#1a1a1a]'
                          : 'bg-[#1a1a1a] border-[#1a1a1a]/70 hover:border-[#2a2a2a] hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[#F8FAFC]">{plan.name}</h3>
                            {plan.popular && (
                              <span className="px-2 py-0.5 text-[10px] font-medium text-[#8B5CF6] bg-[#8B5CF6]/10 rounded border border-[#8B5CF6]/30">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#A1A1AA] mt-1">{plan.features}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-[#F8FAFC]">{plan.price}</div>
                          <div className="text-[10px] text-[#71717A]">/month</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Just Subscribed Button */}
                <div className="border-t border-[#1a1a1a]/70 pt-4 mt-4">
                  <button
                    onClick={handleRefreshSubscription}
                    disabled={refreshing}
                    className="w-full py-2 px-4 text-sm bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {refreshing ? '⏳ Checking...' : '✅ Just Subscribed? Click to Refresh'}
                  </button>
                  {refreshMessage && (
                    <p className="text-xs text-center mt-2 text-[#A1A1AA]">{refreshMessage}</p>
                  )}
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

