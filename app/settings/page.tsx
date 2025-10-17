/**
 * Settings Page - Dark Emerald Theme
 * App configuration and preferences
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon, User, Bell, Key, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/upgrade');
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-5xl font-black text-[#E5E7EB] mb-2">
            Settings
          </h1>
          <p className="text-xl font-bold text-[#9AA4B2]">
            Manage your app configuration
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E5E7EB]">
                <User className="h-5 w-5 text-[#10B981]" />
                Analytics Settings
              </CardTitle>
              <CardDescription className="text-[#9AA4B2]">
                Configure your analytics preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-[#D1D5DB]">
                <span className="font-bold">Current Plan:</span> <span className="text-[#10B981] font-bold">Atom (Free)</span>
              </div>
              <Button 
                onClick={handleUpgrade}
                className="bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E5E7EB]">
                <Bell className="h-5 w-5 text-[#10B981]" />
                Notifications
              </CardTitle>
              <CardDescription className="text-[#9AA4B2]">
                Get notified about insights and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#D1D5DB]">Email insights daily</span>
                <div className="w-12 h-6 bg-[#10B981] rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#D1D5DB]">Weekly summary</span>
                <div className="w-12 h-6 bg-[#2A2F36] rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E5E7EB]">
                <Database className="h-5 w-5 text-[#10B981]" />
                Data & Privacy
              </CardTitle>
              <CardDescription className="text-[#9AA4B2]">
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#D1D5DB]">Data retention</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                  <span className="text-[#10B981] font-bold">7 days</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#D1D5DB]">Analytics tracking</span>
                <div className="w-12 h-6 bg-[#10B981] rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              <Button 
                onClick={handleExportData}
                variant="outline" 
                className="border-[#2A2F36] text-[#9AA4B2] hover:bg-[#2A2F36]"
              >
                Export Data
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E5E7EB]">
                <Bell className="h-5 w-5 text-[#10B981]" />
                Support
              </CardTitle>
              <CardDescription className="text-[#9AA4B2]">
                Get help and provide feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleSubmitFeedback}
                className="bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A] w-full"
              >
                Submit Feedback
              </Button>
              <Button 
                onClick={handleContactSupport}
                variant="outline" 
                className="border-[#2A2F36] text-[#9AA4B2] hover:bg-[#2A2F36] w-full"
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