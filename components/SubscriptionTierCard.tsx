/**
 * Subscription Tier Card Component
 * Displays current tier, usage, and upgrade options
 */

'use client';

import { useEffect, useState } from 'react';

interface TierCardProps {
  clientId: string;
}

interface TierInfo {
  tier: 'free' | 'pro' | 'premium';
  limits: any;
  usage: any;
  canUpgrade: boolean;
}

export function SubscriptionTierCard({ clientId }: TierCardProps) {
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTierInfo();
  }, [clientId]);

  const fetchTierInfo = async () => {
    try {
      const response = await fetch(`/api/subscription-tiers/check?clientId=${clientId}`);
      const data = await response.json();
      
      if (data.success) {
        setTierInfo(data);
      }
    } catch (error) {
      console.error('Error fetching tier info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!tierInfo) {
    return null;
  }

  const tierColors = {
    free: 'bg-gray-100 text-gray-700',
    pro: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
  };

  const tierBadgeColors = {
    free: 'bg-gray-500',
    pro: 'bg-blue-600',
    premium: 'bg-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-black text-black dark:text-white">Your Plan</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-2xl font-bold ${tierColors[tierInfo.tier]}`}>
              {tierInfo.limits.name}
            </span>
            {tierInfo.limits.price > 0 && (
              <span className="text-black font-bold dark:text-white">${tierInfo.limits.price}/mo</span>
            )}
          </div>
        </div>
        
        {tierInfo.canUpgrade && (
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Upgrade
          </button>
        )}
      </div>

      {/* Usage Stats */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-black font-bold dark:text-white">Students</span>
            <span className="font-medium">
              {tierInfo.usage.students.current} / {tierInfo.usage.students.limit === Infinity ? '∞' : tierInfo.usage.students.limit}
            </span>
          </div>
          {tierInfo.usage.students.limit !== Infinity && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${tierBadgeColors[tierInfo.tier]}`}
                style={{ width: `${Math.min(tierInfo.usage.students.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-black font-bold dark:text-white">Forms</span>
            <span className="font-medium">
              {tierInfo.usage.forms.current} / {tierInfo.usage.forms.limit === Infinity ? '∞' : tierInfo.usage.forms.limit}
            </span>
          </div>
          {tierInfo.usage.forms.limit !== Infinity && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${tierBadgeColors[tierInfo.tier]}`}
                style={{ width: `${Math.min(tierInfo.usage.forms.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-base font-black text-black dark:text-white mb-2">Features</h4>
        <ul className="space-y-1 text-base font-bold text-black dark:text-white">
          {tierInfo.limits.exportEnabled && <li>✓ CSV/PDF Exports</li>}
          {tierInfo.limits.aiInsights && <li>✓ AI-Powered Insights</li>}
          {tierInfo.limits.advancedAnalytics && <li>✓ Advanced Analytics</li>}
          {tierInfo.limits.customBranding && <li>✓ Custom Branding</li>}
        </ul>
      </div>
    </div>
  );
}

