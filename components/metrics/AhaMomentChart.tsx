'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface AhaMomentChartProps {
  data: {
    topExperiences: Array<{
      experienceId: string;
      experienceName: string;
      spikePercent: number;
      studentCount: number;
    }>;
    avgTimeToFirstBreakthrough: string;
    stagnantStudents: number;
  };
}

export default function AhaMomentChart({ data }: AhaMomentChartProps) {
  const { topExperiences, avgTimeToFirstBreakthrough, stagnantStudents } = data;

  return (
    <Card className="relative rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">Breakthrough Moments</h3>
              <p className="text-sm text-[#A1A1AA]">Content that sparks student success</p>
            </div>
          <TrendingUp className="w-5 h-5 text-green-500" style={{ filter: 'drop-shadow(0 0 8px #10B981)' }} />
        </div>

        {/* Top Experiences */}
        <div className="space-y-4 mb-6">
          {topExperiences.length > 0 ? (
            topExperiences.slice(0, 3).map((exp, index) => (
              <div key={exp.experienceId} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white truncate">{exp.experienceName}</div>
                  <div className="text-xs text-zinc-400">{exp.studentCount} students</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400" style={{ textShadow: '0 0 8px #10B981' }}>+{exp.spikePercent.toFixed(0)}%</div>
                  <div className="text-xs text-zinc-400">spike</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-sm text-zinc-400">No breakthrough data yet</div>
              <div className="text-xs text-zinc-500 mt-1">Track student engagement to see aha moments</div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" style={{ filter: 'drop-shadow(0 0 8px #3B82F6)' }} />
              <span className="text-xs text-zinc-400">Avg. Time to Breakthrough</span>
            </div>
            <div className="text-lg font-bold text-white">{avgTimeToFirstBreakthrough}</div>
          </div>
          
          <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} />
              <span className="text-xs text-zinc-400">Stagnant Students</span>
            </div>
            <div className="text-lg font-bold text-white">{stagnantStudents}</div>
          </div>
        </div>

        {/* AI Insight */}
        {topExperiences.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/40">
            <div className="text-xs text-emerald-300 font-medium mb-1">AI Insight</div>
            <div className="text-sm text-emerald-200">
              {topExperiences[0].experienceName} causes a {topExperiences[0].spikePercent.toFixed(0)}% engagement spike - this is your core value module
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
