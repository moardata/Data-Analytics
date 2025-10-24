'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className="relative rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">Student Consistency</h3>
              <p className="text-sm text-[#A1A1AA]">How regularly your students show up</p>
            </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{averageScore.toFixed(1)}</div>
            <div className="text-xs text-zinc-400">out of 100</div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" style={{ boxShadow: '0 0 8px #A855F7' }}></div>
              <span className="text-sm text-zinc-300">High (70-100)</span>
            </div>
            <span className="text-sm font-medium text-white">{distribution.high}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" style={{ boxShadow: '0 0 8px #3B82F6' }}></div>
              <span className="text-sm text-zinc-300">Medium (40-69)</span>
            </div>
            <span className="text-sm font-medium text-white">{distribution.medium}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" style={{ boxShadow: '0 0 8px #F59E0B' }}></div>
              <span className="text-sm text-zinc-300">Low (0-39)</span>
            </div>
            <span className="text-sm font-medium text-white">{distribution.low}</span>
          </div>
        </div>

        {/* Trend */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">vs last period</span>
            <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
