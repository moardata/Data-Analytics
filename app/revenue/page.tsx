/**
 * Revenue Page - Dark Emerald Theme
 * Advanced revenue dashboard with charts and insights
 * REQUIRES ACTIVE SUBSCRIPTION
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import RevenueDashboard from '@/components/RevenueDashboard';
import { PaywallGuard } from '@/components/PaywallGuard';

export const dynamic = 'force-dynamic';

function RevenueContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRevenue();
  }, [clientId]);

  const fetchRevenue = async () => {
    try {
      const response = await fetch(`/api/revenue?companyId=${clientId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error('❌ Failed to fetch revenue:', errorData);
        alert(`Revenue API Error: ${errorData.error || response.statusText}`);
        setRevenue([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setRevenue(data.revenue || []);
    } catch (error) {
      console.error('❌ Error fetching revenue:', error);
      alert(`Error loading revenue: ${error}`);
      setRevenue([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.open(`/api/export/csv?companyId=${clientId}&type=revenue`, '_blank');
  };

  const handleRefresh = async () => {
    if (!clientId) {
      console.error('❌ No clientId provided for refresh');
      return;
    }
    
    try {
      setRefreshing(true);
      
      await fetchRevenue();
      
    } catch (error) {
      console.error('❌ Error refreshing revenue:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] p-8">
      <div className="max-w-7xl mx-auto">
        <RevenueDashboard revenueData={revenue} onExport={handleExport} onRefresh={handleRefresh} refreshing={refreshing} />
      </div>
    </div>
  );
}

export default function RevenuePage() {
  return (
    <PaywallGuard feature="Revenue Dashboard">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <RevenueContent />
      </Suspense>
    </PaywallGuard>
  );
}
