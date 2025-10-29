/**
 * Paywall Guard Component
 * Wraps content that requires a subscription
 * Shows paywall modal if user doesn't have access
 */

'use client';

import { usePaywall } from '@/hooks/use-paywall';
import { PaywallModal } from './PaywallModal';
import { ReactNode } from 'react';

interface PaywallGuardProps {
  children: ReactNode;
  feature?: string; // Name of feature being protected (for messaging)
  fallback?: ReactNode; // Show this while checking subscription
}

export function PaywallGuard({ children, feature, fallback }: PaywallGuardProps) {
  const { hasAccess, loading, showPaywall, setShowPaywall } = usePaywall();

  // Show loading state
  if (loading) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-400">Checking access...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // If user has access, show the content
  if (hasAccess) {
    return <>{children}</>;
  }

  // No access - show paywall modal and a message
  return (
    <>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md text-center p-8 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Subscription Required
          </h2>
          <p className="text-gray-400 mb-6">
            {feature 
              ? `${feature} requires an active subscription` 
              : 'This feature requires an active subscription'}
          </p>
          <button
            onClick={() => setShowPaywall(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/30"
          >
            View Plans
          </button>
        </div>
      </div>

      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)}
        reason={feature}
      />
    </>
  );
}

