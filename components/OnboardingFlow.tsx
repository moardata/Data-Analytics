/**
 * First-Time Onboarding Flow
 * Guides new users through essential setup steps
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Info, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OnboardingFlowProps {
  onInfoClick: () => void;
  onSettingsClick?: () => void;
  onStartTrialClick?: () => void;
}

export function OnboardingFlow({ onInfoClick, onSettingsClick, onStartTrialClick }: OnboardingFlowProps) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0); // Start at 0 for trial prompt

  useEffect(() => {
    // Check if user has completed onboarding
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('onboarding_completed_v2');
      if (!completed) {
        // Show after a brief delay so the app loads first
        setTimeout(() => setShow(true), 1000);
      }
    }
  }, []);

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_completed_v2', 'true');
    }
    setShow(false);
  };

  const handleInfoClick = () => {
    if (onInfoClick) onInfoClick();
    // Move to step 2 after 2 seconds
    setTimeout(() => setStep(2), 2000);
  };

  const handleStartTrial = () => {
    if (onStartTrialClick) {
      onStartTrialClick();
    }
    // Move to next step
    setStep(1);
  };

  const handleSettingsClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_completed_v2', 'true');
    }
    setShow(false);
    
    // Navigate to settings page if callback provided
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Fallback: just close and let them navigate manually
      window.location.href = '/settings' + window.location.search;
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border border-[#1a1a1a] bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden">
        {/* Subtle sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none"></div>
        
        <CardHeader className="relative">
          <button 
            onClick={handleSkip}
            className="absolute right-4 top-4 p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors z-10"
          >
            <X className="h-4 w-4 text-[#A1A1AA] hover:text-[#F8FAFC]" />
          </button>
          
          <div className="mb-2">
            <CardTitle className="text-[#F8FAFC] text-xl font-bold mb-3">
              {step === 0 ? 'Welcome to CreatorIQ! 🎉' : 'Quick Setup Guide'}
            </CardTitle>
            {step > 0 && (
              <div className="flex items-center gap-2">
                <div className={`h-2 w-full rounded-full transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]' : 'bg-[#1a1a1a]'}`}></div>
                <div className={`h-2 w-full rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-[#F59E0B] to-[#10B981]' : 'bg-[#1a1a1a]'}`}></div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-[#F8FAFC] text-2xl font-bold mb-3 text-center">
                  Welcome to CreatorIQ!
                </h3>
                <p className="text-[#D1D5DB] text-center mb-4">
                  Start your <span className="text-emerald-400 font-bold">7-day FREE trial</span> and unlock AI-powered insights for your community.
                </p>
                
                <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
                  <ul className="space-y-2 text-sm text-[#D1D5DB]">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Up to 100 students
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      5 AI insights per day
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Unlimited custom forms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Full analytics dashboard
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-center text-gray-500 mb-4">
                  No charge for 7 days • Then $30/month • Cancel anytime
                </p>
              </div>

              <Button 
                onClick={handleStartTrial}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2 h-12 shadow-lg shadow-emerald-500/30 text-lg font-semibold"
              >
                🚀 Start 7-Day Free Trial
              </Button>

              <button 
                onClick={() => setStep(1)}
                className="w-full text-[#A1A1AA] hover:text-[#F8FAFC] text-sm transition-colors hover:underline"
              >
                I'll do this later
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="bg-gradient-to-r from-[#8B5CF6]/5 to-[#3B82F6]/5 border border-[#8B5CF6]/20 rounded-lg p-4 border-l-2 border-l-[#8B5CF6]">
                <h3 className="text-[#F8FAFC] font-semibold mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-bold">1</span>
                  Learn How It Works
                </h3>
                <p className="text-[#D1D5DB] text-sm leading-relaxed">
                  First, check out the <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent font-semibold">Information panel</span> to understand how CreatorIQ helps you grow your community with AI-powered insights.
                </p>
              </div>

              <Button 
                onClick={handleInfoClick}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white gap-2 h-12 shadow-lg shadow-[#8B5CF6]/20 border border-[#8B5CF6]/30"
              >
                <Info className="h-4 w-4" />
                Open Information Guide
              </Button>

              <button 
                onClick={handleSkip}
                className="w-full text-[#A1A1AA] hover:text-[#F8FAFC] text-sm transition-colors hover:underline"
              >
                Skip Tutorial
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-gradient-to-r from-[#10B981]/10 to-[#3B82F6]/10 border border-[#10B981]/30 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#10B981]" />
                <span className="text-[#10B981] text-sm font-medium">Step 1 Complete!</span>
              </div>

              <div className="bg-gradient-to-r from-[#F59E0B]/5 to-[#10B981]/5 border border-[#F59E0B]/20 rounded-lg p-4 border-l-2 border-l-[#F59E0B]">
                <h3 className="text-[#F8FAFC] font-semibold mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#10B981] text-white text-sm font-bold">2</span>
                  Sync Your Students
                </h3>
                <p className="text-[#D1D5DB] text-sm leading-relaxed mb-3">
                  Import your existing students from Whop to start tracking engagement, generating insights, and collecting feedback.
                </p>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 text-xs text-[#A1A1AA]">
                  💡 This pulls all current members from your Whop group into the analytics dashboard
                </div>
              </div>

              <Button 
                onClick={handleSettingsClick}
                className="w-full bg-gradient-to-r from-[#F59E0B] to-[#10B981] hover:from-[#EA580C] hover:to-[#059669] text-white gap-2 h-12 shadow-lg shadow-[#F59E0B]/20 border border-[#F59E0B]/30"
              >
                <RefreshCw className="h-4 w-4" />
                Go to Settings & Sync
              </Button>

              <button 
                onClick={handleSkip}
                className="w-full text-[#A1A1AA] hover:text-[#F8FAFC] text-sm transition-colors hover:underline"
              >
                I'll do this later
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

