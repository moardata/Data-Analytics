/**
 * Paywall Hook
 * Checks if user has an active subscription
 * Shows paywall modal if they don't
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export interface SubscriptionStatus {
  hasAccess: boolean;
  currentTier: string | null;
  subscriptionStatus: string | null;
  loading: boolean;
}

export function usePaywall() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasAccess: false,
    currentTier: null,
    subscriptionStatus: null,
    loading: true
  });

  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, [companyId]);

  const checkSubscription = async () => {
    try {
      const response = await fetch(`/api/subscription/status?companyId=${companyId}`);
      const data = await response.json();

      setStatus({
        hasAccess: data.hasAccess || false,
        currentTier: data.currentTier,
        subscriptionStatus: data.subscriptionStatus,
        loading: false
      });

      // If no access, show paywall
      if (!data.hasAccess) {
        setShowPaywall(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const requireSubscription = (reason?: string) => {
    if (!status.hasAccess && !status.loading) {
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  return {
    ...status,
    showPaywall,
    setShowPaywall,
    requireSubscription,
    refreshStatus: checkSubscription
  };
}

