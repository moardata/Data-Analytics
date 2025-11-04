'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Plus, AlertCircle, CheckCircle, Clock, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface FeedbackThemesListProps {
  data: {
    hasData: boolean;
    themes: Array<{
      title: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      sharePct: number;
      urgency: 'low' | 'medium' | 'high';
      suggestedAction: string;
    }>;
    totalSubmissions: number;
    lastUpdated: string;
    ctaMessage?: string;
  };
}

export default function FeedbackThemesList({ data }: FeedbackThemesListProps) {
  const { hasData, themes, totalSubmissions, lastUpdated, ctaMessage } = data;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'negative': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-400 bg-emerald-900/20 border-emerald-700/40';
      case 'negative': return 'text-red-400 bg-red-900/20 border-red-700/40';
      default: return 'text-zinc-400 bg-zinc-900/20 border-zinc-700/40';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-zinc-500';
    }
  };

  if (!hasData) {
    return (
      <Card className="relative rounded-2xl border-l-4 border-l-[#3B82F6]/50 border-t border-r border-b border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#3B82F6]/20 transition-all">
        {/* Metallic sheen */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
        </div>
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-6 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[#F8FAFC] truncate">What Students Say</h3>
              <p className="text-sm text-[#A1A1AA]">No feedback yet</p>
            </div>
            <MessageSquare className="w-5 h-5 text-[#71717A] flex-shrink-0" />
          </div>

          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-[#3F3F46] mx-auto mb-4" />
            <div className="text-sm text-[#A1A1AA] mb-2">{ctaMessage || 'No feedback data available'}</div>
            <div className="text-xs text-[#71717A] mb-4">
              {totalSubmissions} submissions collected
            </div>
            <div className="text-xs text-[#71717A]">
              Create surveys from the Forms page to start collecting feedback
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative rounded-2xl border-l-4 border-l-[#3B82F6]/50 border-t border-r border-b border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#3B82F6]/20 transition-all">
      {/* Metallic sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-[#F8FAFC] truncate">What Students Say</h3>
              <div className="group/info relative">
                <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors flex-shrink-0" />
                <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                  <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Student Feedback Themes</p>
                  <p className="text-xs text-[#A1A1AA]">AI analyzes survey responses to find common themes. Discover what students love and what needs improvement!</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#A1A1AA]">{totalSubmissions} responses analyzed</p>
          </div>
          <MessageSquare className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        </div>

        {themes.length > 0 ? (
          <div className="space-y-4">
            {themes.map((theme, index) => (
              <div key={index} className="p-4 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a] hover:border-[#10B981]/30 transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2 flex-wrap">
                      {getSentimentIcon(theme.sentiment)}
                      <span className="text-sm font-medium text-white truncate">{theme.title}</span>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getSentimentColor(theme.sentiment)} whitespace-nowrap`}>
                        {theme.sentiment}
                      </div>
                    </div>
                    <div className="text-sm text-[#E2E8F0] line-clamp-2">{theme.suggestedAction}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{theme.sharePct}%</div>
                      <div className="text-xs text-[#A1A1AA] whitespace-nowrap">share</div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getUrgencyColor(theme.urgency)} flex-shrink-0`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                  <span>Urgency: {theme.urgency}</span>
                  <span>{theme.sharePct}% of responses</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-[#3F3F46] mx-auto mb-4" />
            <div className="text-sm text-[#A1A1AA]">No themes identified yet</div>
            <div className="text-xs text-[#71717A] mt-1">AI is analyzing your feedback data</div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t border-[#1a1a1a]/50">
          <div className="text-xs text-[#A1A1AA]">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
