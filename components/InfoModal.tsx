/**
 * Info Modal Component
 * Beautiful glassy modal for displaying messages
 */

'use client';

import React from 'react';
import { X, MessageCircle, HelpCircle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: 'feedback' | 'support';
}

export function InfoModal({ isOpen, onClose, title, message, icon = 'feedback' }: InfoModalProps) {
  if (!isOpen) return null;

  const Icon = icon === 'feedback' ? MessageCircle : HelpCircle;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative max-w-md w-full bg-gradient-to-br from-[#0a0a0a]/95 via-[#0f0f0f]/95 to-[#0a0a0a]/95 border border-[#10B981]/30 rounded-2xl shadow-2xl shadow-[#10B981]/20 backdrop-blur-xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#10B981]/20 to-[#0E9F71]/20 rounded-2xl blur opacity-75" />
        
        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#0E9F71]/20 border border-[#10B981]/30 flex items-center justify-center">
                <Icon className="h-6 w-6 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors p-1 hover:bg-[#1a1a1a] rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Message */}
          <div className="px-6 pb-6">
            <p className="text-[#A1A1AA] leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#0E9F71] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#10B981]/30 transition-all duration-200 hover:scale-[1.02]"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

