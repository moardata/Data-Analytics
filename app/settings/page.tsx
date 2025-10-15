/**
 * Settings Page - Dark Emerald Theme
 * App configuration and preferences
 */

'use client';

import React from 'react';
import { Settings as SettingsIcon, User, Bell, Key, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
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
                Account Settings
              </CardTitle>
              <CardDescription className="text-[#9AA4B2]">
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]">
                Edit Profile
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
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]">
                Manage Notifications
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E5E7EB]">
                <Key className="h-5 w-5 text-[#10B981]" />
                API Keys
              </CardTitle>
              <CardDescription className="text-[#9AA4B2]">
                Manage your API credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-[#D1D5DB]">
                <span className="font-bold">Whop API Key:</span> <span className="font-mono text-[#9AA4B2]">p5EW_xW20***</span>
              </div>
              <div className="text-sm text-[#D1D5DB]">
                <span className="font-bold">Supabase URL:</span> <span className="font-mono text-[#9AA4B2]">rdllbte***</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E5E7EB]">
                <Database className="h-5 w-5 text-[#10B981]" />
                Database
              </CardTitle>
              <CardDescription className="text-[#9AA4B2]">
                Database connection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                <span className="text-[#D1D5DB] font-bold">Connected</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}