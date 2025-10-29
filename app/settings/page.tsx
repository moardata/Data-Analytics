/**
 * Settings Page - Purple/Blue/Emerald Gradient Theme
 * App configuration and preferences - Version 2.0
 */

'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings as SettingsIcon, User, Bell, Key, Database, RefreshCw, MessageCircle, HelpCircle, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoModal } from '@/components/InfoModal';
import { ModernLoadingScreen } from '@/components/ModernLoadingScreen';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const experienceId = searchParams.get('experienceId') || searchParams.get('experience_id');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', icon: 'feedback' as 'feedback' | 'support' });
  
  const [analyticsTracking, setAnalyticsTracking] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('analytics_tracking');
    return saved === null ? true : saved === 'true';
  });

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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-2">
            Settings
          </h1>
          <p className="text-[#A1A1AA]">
            Manage your app configuration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data Management Card */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#2a2a2a] transition-all">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <Database className="h-5 w-5 text-[#10B981]" />
                Data Management
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Import your Whop members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#A1A1AA]">
                Import all current members from Whop to instantly populate your analytics dashboard.
              </p>
              <Button 
                onClick={handleSyncStudents}
                disabled={syncing}
                className="bg-[#10B981] hover:bg-[#0E9F71] text-white flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Importing...' : 'Import Members from Whop'}
              </Button>
              {syncMessage && (
                <div className={`text-xs p-2.5 rounded-lg border ${
                  syncMessage.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  syncMessage.startsWith('🔄') ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                  'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {syncMessage}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#2a2a2a] transition-all">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <User className="h-5 w-5 text-[#10B981]" />
                Subscription
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Manage your plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-[#A1A1AA]">
                <span className="font-medium">Current Plan:</span> <span className="text-[#10B981] font-semibold">Starter</span>
              </div>
              <Button 
                onClick={handleUpgrade}
                className="bg-[#10B981] hover:bg-[#0E9F71] text-white"
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Data & Privacy Card */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#2a2a2a] transition-all">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <Database className="h-5 w-5 text-[#10B981]" />
                Data & Privacy
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Manage your data settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#A1A1AA]">Data retention</span>
                <span className="text-sm font-semibold text-[#10B981]">14 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#A1A1AA]">Analytics tracking</span>
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
              <Button 
                onClick={handleExportData}
                variant="outline" 
                className="border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a] hover:text-white"
              >
                Export Data
              </Button>
            </CardContent>
          </Card>

          {/* Support Card - Spans 2 columns */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#2a2a2a] transition-all md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#10B981]" />
                Support & Feedback
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Get help and share your thoughts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleSubmitFeedback}
                  variant="outline"
                  className="justify-start h-auto p-4 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:border-[#2a2a2a]"
                >
                  <MessageCircle className="h-5 w-5 text-[#10B981] mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-[#F8FAFC]">Submit Feedback</div>
                    <div className="text-xs text-[#A1A1AA]">Share your thoughts</div>
                  </div>
                </Button>

                <Button
                  onClick={handleContactSupport}
                  variant="outline"
                  className="justify-start h-auto p-4 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:border-[#2a2a2a]"
                >
                  <HelpCircle className="h-5 w-5 text-[#10B981] mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-[#F8FAFC]">Contact Support</div>
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
    <Suspense fallback={<ModernLoadingScreen message="Loading settings..." />}>
      <SettingsContent />
    </Suspense>
  );
}