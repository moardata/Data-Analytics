/**
 * Customer View Page
 * Shows limited information for non-admin users
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

function CustomerViewContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-[#D1D5DB] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p>Loading your view...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">
            Welcome to CreatorIQ
          </h1>
          <p className="text-[#9AA4B2]">
            You're viewing this as a member. Contact your company admin for full access to analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info Card */}
          <div className="bg-[#171A1F] border border-[#2A2F36] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">
              Your Access Level
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-[#D1D5DB]">Member Access</span>
              </div>
              <div className="text-[#9AA4B2] text-sm">
                You can view basic information but cannot access detailed analytics.
              </div>
            </div>
          </div>

          {/* Contact Admin Card */}
          <div className="bg-[#171A1F] border border-[#2A2F36] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">
              Need Full Access?
            </h2>
            <div className="space-y-3">
              <div className="text-[#D1D5DB]">
                Contact your company administrator to request access to:
              </div>
              <ul className="text-[#9AA4B2] text-sm space-y-1 ml-4">
                <li>• Detailed analytics dashboard</li>
                <li>• Student engagement metrics</li>
                <li>• Revenue tracking</li>
                <li>• AI-powered insights</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="mt-8 bg-[#171A1F] border border-[#2A2F36] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">
            Company Information
          </h2>
          <div className="text-[#9AA4B2]">
            Company ID: <span className="text-[#D1D5DB] font-mono">{companyId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerViewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CustomerViewContent />
    </Suspense>
  );
}
