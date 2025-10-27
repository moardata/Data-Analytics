'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

interface ConsistencyScoreGaugeProps {
  data: {
    averageScore: number;
    distribution: {
      high: number;
      medium: number;
      low: number;
    };
    trend: string;
  };
}

export default function ConsistencyScoreGauge({ data }: ConsistencyScoreGaugeProps) {
  const { averageScore, distribution, trend } = data;
  
  // Calculate gauge color based on score
  const getGaugeColor = (score: number) => {
    if (score >= 70) return '#A855F7'; // neon purple
    if (score >= 40) return '#3B82F6'; // bright blue
    return '#F59E0B'; // bright yellow
  };

  const gaugeColor = getGaugeColor(averageScore);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (averageScore / 100) * circumference;

  return (
    <Card className="relative rounded-2xl border-l-4 border-l-[#8B5CF6]/50 border-t border-r border-b border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#8B5CF6]/20 transition-all">
      {/* Metallic sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-[#F8FAFC] truncate">Student Consistency</h3>
                <div className="group/info relative">
                  <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors flex-shrink-0" />
                  <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                    <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Student Consistency Score</p>
                    <p className="text-xs text-[#A1A1AA]">Tracks how regularly students engage with your content. Higher consistency = better retention and completion rates!</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#A1A1AA] line-clamp-2">How regularly your students show up</p>
            </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-white">{averageScore.toFixed(1)}</div>
            <div className="text-xs text-[#A1A1AA] whitespace-nowrap">out of 100</div>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#1F2937"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={gaugeColor}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 8px ${gaugeColor})`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{averageScore.toFixed(0)}</div>
                <div className="text-xs text-zinc-400">score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" style={{ boxShadow: '0 0 8px #A855F7' }}></div>
              <span className="text-sm text-[#E2E8F0] truncate">High (70-100)</span>
            </div>
            <span className="text-sm font-medium text-white flex-shrink-0">{distribution.high}</span>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" style={{ boxShadow: '0 0 8px #3B82F6' }}></div>
              <span className="text-sm text-[#E2E8F0] truncate">Medium (40-69)</span>
            </div>
            <span className="text-sm font-medium text-white flex-shrink-0">{distribution.medium}</span>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" style={{ boxShadow: '0 0 8px #F59E0B' }}></div>
              <span className="text-sm text-[#E2E8F0] truncate">Low (0-39)</span>
            </div>
            <span className="text-sm font-medium text-white flex-shrink-0">{distribution.low}</span>
          </div>
        </div>

        {/* Trend */}
        <div className="mt-4 pt-4 border-t border-[#1a1a1a]/50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#A1A1AA] truncate">vs last period</span>
            <span className={`text-sm font-medium flex-shrink-0 ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
