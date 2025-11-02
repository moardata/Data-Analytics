/**
 * Usage Limit Modal
 * Modern modal for displaying usage limit errors with upgrade CTA
 */

'use client';

import { X, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  details?: {
    current?: number;
    limit?: number;
    limitReached?: boolean;
  };
}

export function UsageLimitModal({ isOpen, onClose, error, details }: UsageLimitModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    // Navigate to upgrade page with query params preserved
    const params = new URLSearchParams(window.location.search);
    router.push(`/upgrade?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] rounded-2xl shadow-2xl shadow-[#F59E0B]/10 max-w-md w-full">
        {/* Metallic sheen overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
        </div>
        
        {/* Header */}
        <div className="relative z-10 p-6 pb-4 border-b border-[#1a1a1a]/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Zap className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F8FAFC]">Daily Limit Reached</h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5">Time to upgrade!</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#1a1a1a] rounded-lg transition-all -mr-2 -mt-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 p-6 space-y-4">
          {/* Usage Stats */}
          {details && (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#A1A1AA]">Today's Usage</span>
                <span className="text-sm font-bold text-amber-400">{details.current || 0} / {details.limit || 5}</span>
              </div>
              <div className="relative w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((details.current || 0) / (details.limit || 5)) * 100, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          <div className="text-center space-y-2">
            <p className="text-[#F8FAFC] text-sm leading-relaxed">
              You've used all your daily AI insights for today. Upgrade to get unlimited insights and unlock premium features!
            </p>
          </div>

          {/* Features Preview */}
          <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 border border-[#8B5CF6]/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#E2E8F0]">
              <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
              <span>Unlimited AI insights</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#E2E8F0]">
              <TrendingUp className="h-4 w-4 text-[#3B82F6]" />
              <span>Advanced analytics & reports</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#E2E8F0]">
              <Zap className="h-4 w-4 text-[#10B981]" />
              <span>Priority support</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button 
              onClick={handleUpgrade}
              className="w-full gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#8B5CF6]/20"
            >
              <Zap className="h-4 w-4" />
              Upgrade Now
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#A1A1AA] hover:text-[#F8FAFC] rounded-xl transition-all"
            >
              Maybe Later
            </Button>
          </div>

          {/* Reset Info */}
          <p className="text-center text-xs text-[#71717A] pt-2">
            Your limit resets tomorrow at midnight
          </p>
        </div>
      </div>
    </div>
  );
}

