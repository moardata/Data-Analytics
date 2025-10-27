'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Activity, HelpCircle } from 'lucide-react';

interface PopularContentListProps {
  data: {
    content: Array<{
      experienceId: string;
      name: string;
      engagements: number;
      uniqueStudents: number;
      trend: string;
    }>;
    totalEngagements: number;
    totalUniqueStudents: number;
    lastUpdated: string;
  };
}

export default function PopularContentList({ data }: PopularContentListProps) {
  const { content, totalEngagements, totalUniqueStudents, lastUpdated } = data;

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
              <h3 className="text-base font-semibold text-[#F8FAFC] truncate">What's Hot Right Now</h3>
              <div className="group/info relative">
                <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors flex-shrink-0" />
                <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                  <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Popular Content Today</p>
                  <p className="text-xs text-[#A1A1AA]">Shows your most-engaged content in real-time. See what's working right now and promote it!</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#A1A1AA] line-clamp-2">Today's most-viewed content</p>
          </div>
          <Activity className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a]">
            <div className="flex items-center space-x-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-[#A1A1AA] truncate">Total Engagements</span>
            </div>
            <div className="text-lg font-bold text-white truncate">{totalEngagements}</div>
          </div>
          
          <div className="p-3 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a]">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-[#A1A1AA] truncate">Active Students</span>
            </div>
            <div className="text-lg font-bold text-white truncate">{totalUniqueStudents}</div>
          </div>
        </div>

        {/* Content List */}
        {content.length > 0 ? (
          <div className="space-y-3">
            {content.map((item, index) => (
              <div key={item.experienceId} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a] hover:border-[#10B981]/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-400">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{item.name}</div>
                      <div className="text-xs text-[#A1A1AA] truncate">
                        {item.uniqueStudents} students • {item.engagements} engagements
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{item.engagements}</div>
                    <div className="text-xs text-[#A1A1AA] whitespace-nowrap">engagements</div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`w-4 h-4 flex-shrink-0 ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className={`text-sm font-medium whitespace-nowrap ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-[#3F3F46] mx-auto mb-4" />
            <div className="text-sm text-[#A1A1AA]">No activity today</div>
            <div className="text-xs text-[#71717A] mt-1">Check back when students are active</div>
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
