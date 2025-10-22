/**
 * Settings Page - Dark Emerald Theme
 * App configuration and preferences
 */

'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings as SettingsIcon, User, Bell, Key, Database, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const experienceId = searchParams.get('experienceId') || searchParams.get('experience_id');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

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
    // TODO: Implement feedback form
    alert('Feedback form coming soon!');
  };

  const handleContactSupport = () => {
    // TODO: Implement support contact
    alert('Support contact coming soon!');
  };

  const handleSyncStudents = async () => {
    if (!companyId) {
      setSyncMessage('❌ No company ID found. Please access through Whop.');
      return;
    }

    setSyncing(true);
    setSyncMessage('🔄 Syncing students from Whop...');

    try {
      const response = await fetch(`/api/sync/students?companyId=${companyId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSyncMessage(`✅ ${data.message}`);
        setTimeout(() => {
          router.push(`/students${queryString}`);
        }, 2000);
      } else {
        setSyncMessage(`❌ ${data.error || 'Failed to sync students'}`);
      }
    } catch (error) {
      setSyncMessage('❌ Error syncing students. Please try again.');
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
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                <Database className="h-5 w-5 text-[#10B981]" />
                Data Management
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Sync and manage your student data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-[#A1A1AA]">
                <p className="mb-2">
                  Import existing students from Whop into your analytics dashboard.
                </p>
                <p className="text-xs text-[#A1A1AA]">
                  This will sync all current members from your Whop group.
                </p>
              </div>
              <Button 
                onClick={handleSyncStudents}
                disabled={syncing}
                className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Students from Whop'}
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
                <div className="w-12 h-6 bg-[#10B981] rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Weekly summary</span>
                <div className="w-12 h-6 bg-[#1a1a1a] rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                </div>
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
                <div className="w-12 h-6 bg-[#10B981] rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
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
              <Button 
                onClick={handleSubmitFeedback}
                className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] w-full"
              >
                Submit Feedback
              </Button>
              <Button 
                onClick={handleContactSupport}
                variant="outline" 
                className="border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a] w-full"
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
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