'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingScreen({ message = 'Loading...', size = 'md' }: LoadingScreenProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-[#1a1a1a] border-t-purple-500 animate-spin`} />
        
        {/* Inner sparkle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
        </div>
      </div>
      
      {/* Message */}
      <p className="mt-6 text-[#F8FAFC] font-medium">{message}</p>
      <p className="mt-2 text-sm text-[#A1A1AA]">Just a moment...</p>
    </div>
  );
}

export function InlineLoader({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-[#1a1a1a] border-t-emerald-500 animate-spin" />
      </div>
      {message && <span className="text-sm text-[#A1A1AA]">{message}</span>}
    </div>
  );
}

export function PageLoader({ message = 'Loading your dashboard...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
      <div className="text-center">
        <div className="relative inline-block">
          {/* Animated gradient ring */}
          <div className="w-20 h-20 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-500 via-emerald-500 to-blue-500 animate-spin" 
               style={{ 
                 background: 'linear-gradient(to right, #a855f7, #10b981, #3b82f6)',
                 WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                 WebkitMaskComposite: 'xor',
                 maskComposite: 'exclude',
                 padding: '4px'
               }} 
          />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
          </div>
        </div>
        
        <h3 className="mt-6 text-xl font-semibold text-[#F8FAFC]">{message}</h3>
        <p className="mt-2 text-sm text-[#A1A1AA]">Setting things up for you...</p>
      </div>
    </div>
  );
}

