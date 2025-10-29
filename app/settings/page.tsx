/**
 * Settings Page - Dark Emerald Theme
 * App configuration and preferences
 */

'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings as SettingsIcon, User, Bell, Key, Database, RefreshCw, MessageCircle, HelpCircle } from 'lucide-react';
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
        <div className="flex items-center gap-4 pb-6 border-b border-purple-500/20">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <SettingsIcon className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-sm text-[#A1A1AA]">
              Manage your app configuration
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Management Card */}
          <Card className="border border-purple-500/30 bg-[#0f0f0f]/50 backdrop-blur-sm shadow-xl shadow-purple-500/5 hover:border-purple-500/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Database className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Data Management
                  </CardTitle>
                  <CardDescription className="text-xs text-[#A1A1AA]">
                    Import your Whop members
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              <div className="text-xs text-[#A1A1AA] leading-relaxed">
                Import all current members from Whop to instantly populate your analytics dashboard with names, emails, and profile photos.
              </div>
              <Button 
                onClick={handleSyncStudents}
                disabled={syncing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] text-sm font-semibold py-2.5"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Importing...' : 'Import Members'}
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
          <Card className="border border-blue-500/30 bg-[#0f0f0f]/50 backdrop-blur-sm shadow-xl shadow-blue-500/5 hover:border-blue-500/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Subscription
                  </CardTitle>
                  <CardDescription className="text-xs text-[#A1A1AA]">
                    Manage your plan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <span className="text-xs text-[#A1A1AA]">Current Plan:</span>
                <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Starter</span>
              </div>
              <Button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white border-0 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] text-sm font-semibold py-2.5"
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Data & Privacy Card */}
          <Card className="border border-emerald-500/30 bg-[#0f0f0f]/50 backdrop-blur-sm shadow-xl shadow-emerald-500/5 hover:border-emerald-500/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Database className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    Data & Privacy
                  </CardTitle>
                  <CardDescription className="text-xs text-[#A1A1AA]">
                    Manage your data settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a1a]/50 border border-emerald-500/20">
                <span className="text-xs text-[#A1A1AA]">Data retention</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-400">14 days</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a1a]/50 border border-purple-500/20">
                <span className="text-xs text-[#A1A1AA]">Analytics tracking</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={analyticsTracking}
                    onChange={(e) => handleToggle('analytics_tracking', e.target.checked)}
                  />
                  <div className="w-10 h-5 bg-[#1a1a1a] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-[22px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500 shadow-lg"></div>
                </label>
              </div>
              <Button 
                onClick={handleExportData}
                variant="outline" 
                className="w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60 transition-all text-sm py-2.5 shadow-lg shadow-emerald-500/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>

          {/* Support Card - Spans 2 columns */}
          <Card className="border border-pink-500/30 bg-[#0f0f0f]/50 backdrop-blur-sm shadow-xl shadow-pink-500/5 hover:border-pink-500/50 transition-all md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center shadow-lg shadow-pink-500/20">
                  <Bell className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Support & Feedback
                  </CardTitle>
                  <CardDescription className="text-xs text-[#A1A1AA]">
                    Get help and share your thoughts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button 
                  onClick={handleSubmitFeedback}
                  className="w-full group relative overflow-hidden rounded-lg border border-purple-500/30 bg-[#0a0a0a]/50 p-3 text-left transition-all duration-200 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/40 flex items-center justify-center shadow-md shadow-purple-500/20">
                      <MessageCircle className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#F8FAFC] group-hover:text-purple-300 transition-colors">
                        Submit Feedback
                      </div>
                      <div className="text-xs text-[#A1A1AA]">
                        Share your thoughts
                      </div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={handleContactSupport}
                  className="w-full group relative overflow-hidden rounded-lg border border-blue-500/30 bg-[#0a0a0a]/50 p-3 text-left transition-all duration-200 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/40 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <HelpCircle className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#F8FAFC] group-hover:text-blue-300 transition-colors">
                        Contact Support
                      </div>
                      <div className="text-xs text-[#A1A1AA]">
                        Get help quickly
                      </div>
                    </div>
                  </div>
                </button>
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
        <div className="text-[#A1A1AA] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}