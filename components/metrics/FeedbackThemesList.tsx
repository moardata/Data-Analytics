'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
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
      <Card className="relative rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">What Students Say</h3>
              <p className="text-sm text-[#A1A1AA]">No feedback yet</p>
            </div>
            <MessageSquare className="w-5 h-5 text-zinc-500" />
          </div>

          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <div className="text-sm text-zinc-400 mb-2">{ctaMessage || 'No feedback data available'}</div>
            <div className="text-xs text-zinc-500 mb-4">
              {totalSubmissions} submissions collected
            </div>
            <Link href="/forms">
              <button className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create Survey</span>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">What Students Say</h3>
            <p className="text-sm text-[#A1A1AA]">{totalSubmissions} responses analyzed</p>
          </div>
          <MessageSquare className="w-5 h-5 text-emerald-500" />
        </div>

        {themes.length > 0 ? (
          <div className="space-y-4">
            {themes.map((theme, index) => (
              <div key={index} className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getSentimentIcon(theme.sentiment)}
                      <span className="text-sm font-medium text-white">{theme.title}</span>
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getSentimentColor(theme.sentiment)}`}>
                        {theme.sentiment}
                      </div>
                    </div>
                    <div className="text-sm text-zinc-300 mb-2">{theme.suggestedAction}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{theme.sharePct}%</div>
                      <div className="text-xs text-zinc-400">share</div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getUrgencyColor(theme.urgency)}`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Urgency: {theme.urgency}</span>
                  <span>{theme.sharePct}% of responses</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <div className="text-sm text-zinc-400">No themes identified yet</div>
            <div className="text-xs text-zinc-500 mt-1">AI is analyzing your feedback data</div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-500">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
