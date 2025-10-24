'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface CommitmentDistributionProps {
  data: {
    averageScore: number;
    distribution: {
      high: number;
      medium: number;
      atRisk: number;
    };
    atRiskStudents: Array<{
      entityId: string;
      name: string;
      score: number;
      riskFactors: string[];
    }>;
    totalStudents: number;
  };
}

export default function CommitmentDistribution({ data }: CommitmentDistributionProps) {
  const { averageScore, distribution, atRiskStudents, totalStudents } = data;

  // Calculate percentages
  const total = distribution.high + distribution.medium + distribution.atRisk;
  const highPct = total > 0 ? (distribution.high / total) * 100 : 0;
  const mediumPct = total > 0 ? (distribution.medium / total) * 100 : 0;
  const atRiskPct = total > 0 ? (distribution.atRisk / total) * 100 : 0;

  return (
    <Card className="relative rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">Student Commitment</h3>
              <p className="text-sm text-[#A1A1AA]">Who's likely to complete your course</p>
            </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{averageScore.toFixed(1)}</div>
            <div className="text-xs text-zinc-400">avg score</div>
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="space-y-4 mb-6">
          {/* High Commitment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" style={{ filter: 'drop-shadow(0 0 8px #10B981)' }} />
                <span className="text-sm text-zinc-300">High Commitment (70-100)</span>
              </div>
              <span className="text-sm font-medium text-white">{distribution.high}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${highPct}%`, boxShadow: '0 0 8px #10B981' }}
              ></div>
            </div>
            <div className="text-xs text-zinc-400">{highPct.toFixed(1)}% of students</div>
          </div>

          {/* Medium Commitment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" style={{ filter: 'drop-shadow(0 0 8px #3B82F6)' }} />
                <span className="text-sm text-zinc-300">Medium Commitment (40-69)</span>
              </div>
              <span className="text-sm font-medium text-white">{distribution.medium}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${mediumPct}%`, boxShadow: '0 0 8px #3B82F6' }}
              ></div>
            </div>
            <div className="text-xs text-zinc-400">{mediumPct.toFixed(1)}% of students</div>
          </div>

          {/* At Risk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} />
                <span className="text-sm text-zinc-300">At Risk (0-39)</span>
              </div>
              <span className="text-sm font-medium text-white">{distribution.atRisk}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${atRiskPct}%`, boxShadow: '0 0 8px #F59E0B' }}
              ></div>
            </div>
            <div className="text-xs text-zinc-400">{atRiskPct.toFixed(1)}% of students</div>
          </div>
        </div>

        {/* At-Risk Students */}
        {atRiskStudents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-zinc-300">At-Risk Students</span>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {atRiskStudents.slice(0, 5).map((student, index) => (
                <div key={student.entityId} className="flex items-center justify-between p-2 rounded bg-red-900/20 border border-red-800/40">
                  <div className="flex-1">
                    <div className="text-sm text-white truncate">{student.name}</div>
                    <div className="text-xs text-red-300">
                      {student.riskFactors.slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-red-400">
                    {student.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insight */}
        {atRiskStudents.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-700/40">
            <div className="text-xs text-red-300 font-medium mb-1">AI Alert</div>
            <div className="text-sm text-red-200">
              Flag {atRiskStudents.length} high-risk students who show early abandonment patterns
            </div>
          </div>
        )}

        {/* Total Students */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-400">
            Based on {totalStudents} students with activity data
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
