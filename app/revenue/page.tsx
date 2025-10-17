/**
 * Revenue Page - Dark Emerald Theme
 * Advanced revenue dashboard with charts and insights
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import RevenueDashboard from '@/components/RevenueDashboard';

export const dynamic = 'force-dynamic';

function RevenueContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, [clientId]);

  const fetchRevenue = async () => {
    try {
      const response = await fetch(`/api/revenue?companyId=${clientId}`);
      
      if (!response.ok) {
        console.error('Failed to fetch revenue:', response.statusText);
        setRevenue([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setRevenue(data.revenue || []);
    } catch (error) {
      console.error('Error fetching revenue:', error);
      setRevenue([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.open(`/api/export/csv?companyId=${clientId}&type=revenue`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
      <div className="max-w-7xl mx-auto">
        <RevenueDashboard revenueData={revenue} onExport={handleExport} />
      </div>
    </div>
  );
}

export default function RevenuePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RevenueContent />
    </Suspense>
  );
}
