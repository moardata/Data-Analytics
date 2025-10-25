/**
 * First-Time Onboarding Flow
 * Guides new users through essential setup steps
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OnboardingFlowProps {
  onInfoClick: () => void;
  onSettingsClick?: () => void;
}

export function OnboardingFlow({ onInfoClick, onSettingsClick }: OnboardingFlowProps) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);

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
    onInfoClick();
    // Move to step 2 after 2 seconds
    setTimeout(() => setStep(2), 2000);
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
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="border-[#10B981] border-2 bg-[#0a0a0a] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
        <CardHeader className="relative">
          <button 
            onClick={handleSkip}
            className="absolute right-4 top-4 p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-[#A1A1AA]" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#10B981]" />
            </div>
            <div>
              <CardTitle className="text-[#F8FAFC] text-xl">Welcome to CreatorIQ! 🎉</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-[#10B981]' : 'bg-[#1a1a1a]'}`}></div>
                <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-[#10B981]' : 'bg-[#1a1a1a]'}`}></div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
                <h3 className="text-[#F8FAFC] font-semibold mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#10B981] text-white text-sm font-bold">1</span>
                  Learn How It Works
                </h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">
                  First, check out the <span className="text-[#10B981] font-semibold">Information panel</span> to understand how CreatorIQ helps you grow your community with AI-powered insights.
                </p>
              </div>

              <Button 
                onClick={handleInfoClick}
                className="w-full bg-[#10B981] hover:bg-[#0E9F71] text-white gap-2 h-12"
              >
                <Sparkles className="h-4 w-4" />
                Open Information Guide
              </Button>

              <button 
                onClick={handleSkip}
                className="w-full text-[#A1A1AA] hover:text-[#F8FAFC] text-sm transition-colors"
              >
                Skip Tutorial
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Step 1 Complete!</span>
              </div>

              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
                <h3 className="text-[#F8FAFC] font-semibold mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#10B981] text-white text-sm font-bold">2</span>
                  Sync Your Students
                </h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed mb-3">
                  Import your existing students from Whop to start tracking engagement, generating insights, and collecting feedback.
                </p>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 text-xs text-[#71717A]">
                  💡 This pulls all current members from your Whop group into the analytics dashboard
                </div>
              </div>

              <Button 
                onClick={handleSettingsClick}
                className="w-full bg-[#10B981] hover:bg-[#0E9F71] text-white gap-2 h-12"
              >
                <RefreshCw className="h-4 w-4" />
                Go to Settings & Sync
              </Button>

              <button 
                onClick={handleSkip}
                className="w-full text-[#A1A1AA] hover:text-[#F8FAFC] text-sm transition-colors"
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

