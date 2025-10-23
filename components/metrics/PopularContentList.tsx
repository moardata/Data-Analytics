'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Activity } from 'lucide-react';

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
    <Card className="relative rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-400">Most Popular Today</h3>
            <p className="text-xs text-zinc-500">Real-time engagement</p>
          </div>
          <Activity className="w-5 h-5 text-emerald-500" />
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800">
            <div className="flex items-center space-x-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-zinc-400">Total Engagements</span>
            </div>
            <div className="text-lg font-bold text-white">{totalEngagements}</div>
          </div>
          
          <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-zinc-400">Active Students</span>
            </div>
            <div className="text-lg font-bold text-white">{totalUniqueStudents}</div>
          </div>
        </div>

        {/* Content List */}
        {content.length > 0 ? (
          <div className="space-y-3">
            {content.map((item, index) => (
              <div key={item.experienceId} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-400">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white truncate">{item.name}</div>
                      <div className="text-xs text-zinc-400">
                        {item.uniqueStudents} students • {item.engagements} engagements
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{item.engagements}</div>
                    <div className="text-xs text-zinc-400">engagements</div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`w-4 h-4 ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className={`text-sm font-medium ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <div className="text-sm text-zinc-400">No activity today</div>
            <div className="text-xs text-zinc-500 mt-1">Check back when students are active</div>
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
