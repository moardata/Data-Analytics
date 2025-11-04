/**
 * Settings Page - Purple/Blue/Emerald Gradient Theme
 * App configuration and preferences - Version 2.0
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings as SettingsIcon, User, Bell, Key, Database, RefreshCw, MessageCircle, HelpCircle, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoModal } from '@/components/InfoModal';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const experienceId = searchParams.get('experienceId') || searchParams.get('experience_id');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', icon: 'feedback' as 'feedback' | 'support' });
  const [currentTier, setCurrentTier] = useState<string | null>('Loading...');
  
  const [analyticsTracking, setAnalyticsTracking] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('analytics_tracking');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    if (companyId) {
      fetchCurrentTier();
    }
  }, [companyId]);

  const fetchCurrentTier = async () => {
    try {
      const res = await fetch(`/api/usage/check?companyId=${companyId}`);
      const data = await res.json();
      setCurrentTier(data.tier || 'Free');
    } catch (error) {
      setCurrentTier('Free');
    }
  };

  const handleToggle = (setting: string, value: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(setting, String(value));
    }
    
    switch(setting) {
      case 'analytics_tracking': setAnalyticsTracking(value); break;
    }
  };

  // Build query string to preserve in navigation
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.set('companyId', companyId);
  if (experienceId) queryParams.set('experienceId', experienceId);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const handleUpgrade = () => {
    router.push(`/upgrade${queryString}`);
  };

  const handleExportData = () => {
    alert('Data export feature coming soon!');
  };

  const handleSubmitFeedback = () => {
    setInfoModalData({
      title: 'Submit Feedback',
      message: 'To submit feedback, please message the app creator directly on Whop!\n\nYou can easily find and message us through your Whop dashboard.',
      icon: 'feedback'
    });
    setShowInfoModal(true);
  };

  const handleContactSupport = () => {
    setInfoModalData({
      title: 'Contact Support',
      message: 'Need help? Please message the app creator directly on Whop!\n\nYou can easily find and message us through your Whop dashboard for quick support.',
      icon: 'support'
    });
    setShowInfoModal(true);
  };

  const handleSyncStudents = async () => {
    if (!companyId) {
      setSyncMessage('❌ No company ID found. Please access through Whop.');
      return;
    }

    setSyncing(true);
    setSyncMessage('🔄 Importing members from Whop...');

    try {
      const response = await fetch(`/api/admin/import-members?companyId=${companyId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        const parts = [];
        if (data.imported > 0) parts.push(`${data.imported} imported`);
        if (data.updated > 0) parts.push(`${data.updated} updated`);
        if (data.enriched > 0) parts.push(`${data.enriched} enriched`);
        
        setSyncMessage(`✅ Success! ${parts.join(', ')}. Total: ${data.total} members processed.`);
      } else {
        setSyncMessage(`⚠️ ${data.error || 'Import completed with issues'}`);
      }
    } catch (error) {
      setSyncMessage('❌ Error importing members. Please try again.');
    } finally {
      setSyncing(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-6 relative overflow-hidden">
          {/* Metallic sheen overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Settings</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#10B981] to-[#10B981]/50 rounded-full mb-3"></div>
          </div>
          <p className="text-[#A1A1AA] text-sm relative z-10">
            Manage your app configuration and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Data Management Card */}
          <Card className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 rounded-2xl group">
            {/* Metallic sheen overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2 group-hover:text-[#8B5CF6] transition-colors">
                <Database className="h-5 w-5 text-[#8B5CF6]" />
                Data Management
              </CardTitle>
              <CardDescription className="text-[#A1A1AA] group-hover:text-[#E2E8F0] transition-colors">
                Import your Whop members
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <p className="text-sm text-[#A1A1AA] md:flex-1 group-hover:text-[#E2E8F0] transition-colors">
                  Import all current members from Whop to instantly populate your analytics dashboard.
                </p>
                <div className="md:w-auto">
                  <Button 
                    onClick={handleSyncStudents}
                    disabled={syncing}
                    className="w-full md:w-auto bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-white backdrop-blur-sm transition-all flex items-center gap-2 rounded-xl"
                  >
                    <RefreshCw className={`h-4 w-4 text-[#8B5CF6] ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Importing...' : 'Import Members from Whop'}
                  </Button>
                  {syncMessage && (
                    <div className={`mt-2 text-xs p-2.5 rounded-lg border ${
                      syncMessage.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      syncMessage.startsWith('🔄') ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {syncMessage}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 rounded-2xl group">
            {/* Metallic sheen overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2 group-hover:text-[#3B82F6] transition-colors">
                <User className="h-5 w-5 text-[#3B82F6]" />
                Subscription
              </CardTitle>
              <CardDescription className="text-[#A1A1AA] group-hover:text-[#E2E8F0] transition-colors">
                Manage your plan
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="text-sm text-[#A1A1AA] md:flex-1 group-hover:text-[#E2E8F0] transition-colors">
                  <span className="font-medium">Current Plan:</span> <span className="text-[#8B5CF6] font-semibold capitalize">{currentTier}</span>
                </div>
                <Button 
                  onClick={handleUpgrade}
                  className="w-full md:w-auto bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-white backdrop-blur-sm transition-all rounded-xl"
                >
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy Card */}
          <Card className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 rounded-2xl group">
            {/* Metallic sheen overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2 group-hover:text-[#10B981] transition-colors">
                <Database className="h-5 w-5 text-[#10B981]" />
                Data & Privacy
              </CardTitle>
              <CardDescription className="text-[#A1A1AA] group-hover:text-[#E2E8F0] transition-colors">
                Manage your data settings
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="space-y-3 md:flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A1A1AA] group-hover:text-[#E2E8F0] transition-colors">Data retention</span>
                    <span className="text-sm font-semibold text-[#10B981]">14 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A1A1AA] group-hover:text-[#E2E8F0] transition-colors">Analytics tracking</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={analyticsTracking}
                        onChange={(e) => handleToggle('analytics_tracking', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-[#1a1a1a] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>
                <Button 
                  onClick={handleExportData}
                  className="w-full md:w-auto bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 text-white backdrop-blur-sm transition-all rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2 text-[#10B981]" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 rounded-2xl group">
            {/* Metallic sheen overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2 group-hover:text-[#F59E0B] transition-colors">
                <Bell className="h-5 w-5 text-[#F59E0B]" />
                Support & Feedback
              </CardTitle>
              <CardDescription className="text-[#A1A1AA] group-hover:text-[#E2E8F0] transition-colors">
                Get help and share your thoughts
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleSubmitFeedback}
                  className="justify-start h-auto p-4 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-white backdrop-blur-sm transition-all rounded-xl"
                >
                  <MessageCircle className="h-5 w-5 mr-3 text-[#8B5CF6]" />
                  <div className="text-left">
                    <div className="font-medium">Submit Feedback</div>
                    <div className="text-xs text-[#A1A1AA]">Share your thoughts</div>
                  </div>
                </Button>

                <Button
                  onClick={handleContactSupport}
                  className="justify-start h-auto p-4 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-white backdrop-blur-sm transition-all rounded-xl"
                >
                  <HelpCircle className="h-5 w-5 mr-3 text-[#3B82F6]" />
                  <div className="text-left">
                    <div className="font-medium">Contact Support</div>
                    <div className="text-xs text-[#A1A1AA]">Get help quickly</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Info Modal */}
      <InfoModal 
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={infoModalData.title}
        message={infoModalData.message}
        icon={infoModalData.icon}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] flex items-center justify-center">
        <div className="text-[#A1A1AA] text-sm">Loading...</div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}