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
    <Card className="relative rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] overflow-hidden shadow-lg hover:shadow-xl hover:shadow-green-500/10 transition-all">
      {/* Metallic sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[#F8FAFC] truncate">Breakthrough Moments</h3>
              <p className="text-sm text-[#A1A1AA] line-clamp-2">Content that sparks student success</p>
            </div>
          <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px #10B981)' }} />
        </div>

        {/* Top Experiences */}
        <div className="space-y-3 mb-6">
          {topExperiences.length > 0 ? (
            topExperiences.slice(0, 3).map((exp, index) => (
              <div key={exp.experienceId} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a] hover:border-[#10B981]/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#F8FAFC] truncate">{exp.experienceName}</div>
                  <div className="text-xs text-[#A1A1AA]">{exp.studentCount} students</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-green-400" style={{ textShadow: '0 0 8px #10B981' }}>+{exp.spikePercent.toFixed(0)}%</div>
                  <div className="text-xs text-[#A1A1AA]">spike</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-sm text-[#A1A1AA]">No breakthrough data yet</div>
              <div className="text-xs text-[#71717A] mt-1">Track student engagement to see aha moments</div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a]">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px #3B82F6)' }} />
              <span className="text-xs text-[#A1A1AA] line-clamp-1">Avg. Time to Breakthrough</span>
            </div>
            <div className="text-lg font-bold text-white truncate">{avgTimeToFirstBreakthrough}</div>
          </div>
          
          <div className="p-3 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a]">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} />
              <span className="text-xs text-[#A1A1AA] line-clamp-1">Stagnant Students</span>
            </div>
            <div className="text-lg font-bold text-white truncate">{stagnantStudents}</div>
          </div>
        </div>

        {/* AI Insight */}
        {topExperiences.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-900/20 border border-emerald-700/40">
            <div className="text-xs text-emerald-300 font-medium mb-1">AI Insight</div>
            <div className="text-sm text-emerald-200 line-clamp-2">
              {topExperiences[0].experienceName} causes a {topExperiences[0].spikePercent.toFixed(0)}% engagement spike - this is your core value module
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
