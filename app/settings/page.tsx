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
import { ThemeVariantToggle } from '@/components/ThemeVariantToggle';
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
  
  // Notification settings with localStorage
  const [emailDaily, setEmailDaily] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('email_daily');
    return saved === null ? true : saved === 'true';
  });
  
  const [emailWeekly, setEmailWeekly] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('email_weekly');
    return saved === null ? false : saved === 'true';
  });
  
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
      case 'email_daily': setEmailDaily(value); break;
      case 'email_weekly': setEmailWeekly(value); break;
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
    // TODO: Implement data export
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
    setSyncMessage('🔄 Enriching student data from Whop...');

    try {
      const response = await fetch(`/api/admin/enrich-students?companyId=${companyId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSyncMessage(`✅ Successfully enriched ${data.enrichedCount} student profiles with real names and photos!`);
      } else {
        setSyncMessage(`⚠️ ${data.error || 'Some students could not be enriched'}`);
      }
    } catch (error) {
      setSyncMessage('❌ Error enriching student data. Please try again.');
    } finally {
      setSyncing(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-5xl font-black text-[#F8FAFC] mb-2">
            Settings
          </h1>
          <p className="text-xl font-bold text-[#A1A1AA]">
            Manage your app configuration
          </p>
        </div>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <ThemeVariantToggle />

          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                <Database className="h-5 w-5 text-[#10B981]" />
                Data Management
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Enrich student profiles with real data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-[#A1A1AA]">
                <p className="mb-2">
                  Fetch real names and profile photos from Whop for all your students.
                </p>
                <p className="text-xs text-[#A1A1AA]">
                  This updates existing student records with their actual Whop profile data.
                </p>
              </div>
              <Button 
                onClick={handleSyncStudents}
                disabled={syncing}
                className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Enriching...' : 'Enrich Student Data'}
              </Button>
              {syncMessage && (
                <div className={`text-sm p-3 rounded ${
                  syncMessage.startsWith('✅') ? 'bg-green-900/20 text-green-400' :
                  syncMessage.startsWith('🔄') ? 'bg-blue-900/20 text-blue-400' :
                  'bg-red-900/20 text-red-400'
                }`}>
                  {syncMessage}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                <User className="h-5 w-5 text-[#10B981]" />
                Analytics Settings
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Configure your analytics preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-[#A1A1AA]">
                <span className="font-bold">Current Plan:</span> <span className="text-[#10B981] font-bold">Atom (Free)</span>
              </div>
              <Button 
                onClick={handleUpgrade}
                className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                <Bell className="h-5 w-5 text-[#10B981]" />
                Notifications
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Get notified about insights and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Email insights daily</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailDaily}
                    onChange={(e) => handleToggle('email_daily', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Weekly summary</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailWeekly}
                    onChange={(e) => handleToggle('email_weekly', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                <Database className="h-5 w-5 text-[#10B981]" />
                Data & Privacy
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Data retention</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                  <span className="text-[#10B981] font-bold">7 days</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Analytics tracking</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={analyticsTracking}
                    onChange={(e) => handleToggle('analytics_tracking', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                </label>
              </div>
              <Button 
                onClick={handleExportData}
                variant="outline" 
                className="border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a]"
              >
                Export Data
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                <Bell className="h-5 w-5 text-[#10B981]" />
                Support
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Get help and provide feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                onClick={handleSubmitFeedback}
                className="w-full group relative overflow-hidden rounded-xl border border-[#10B981]/30 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] p-4 text-left transition-all duration-200 hover:border-[#10B981]/50 hover:shadow-lg hover:shadow-[#10B981]/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-colors">
                    <MessageCircle className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#F8FAFC] group-hover:text-[#10B981] transition-colors">
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
                className="w-full group relative overflow-hidden rounded-xl border border-[#10B981]/30 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] p-4 text-left transition-all duration-200 hover:border-[#10B981]/50 hover:shadow-lg hover:shadow-[#10B981]/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-colors">
                    <HelpCircle className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#F8FAFC] group-hover:text-[#10B981] transition-colors">
                      Contact Support
                    </div>
                    <div className="text-xs text-[#A1A1AA]">
                      Get help quickly
                    </div>
                  </div>
                </div>
              </button>
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