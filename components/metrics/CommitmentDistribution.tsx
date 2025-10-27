'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, HelpCircle } from 'lucide-react';

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
    <Card className="relative rounded-2xl border-l-4 border-l-[#F59E0B]/50 border-t border-r border-b border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#F59E0B]/20 transition-all">
      {/* Metallic sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-[#F8FAFC] truncate">Student Commitment</h3>
                <div className="group/info relative">
                  <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors flex-shrink-0" />
                  <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                    <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Student Commitment Score</p>
                    <p className="text-xs text-[#A1A1AA]">Predicts who's likely to complete your course. Identify at-risk students early and provide timely support!</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#A1A1AA] line-clamp-2">Who's likely to complete your course</p>
            </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-white">{averageScore.toFixed(1)}</div>
            <div className="text-xs text-[#A1A1AA] whitespace-nowrap">avg score</div>
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="space-y-4 mb-6">
          {/* High Commitment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px #10B981)' }} />
                <span className="text-sm text-[#E2E8F0] truncate">High Commitment (70-100)</span>
              </div>
              <span className="text-sm font-medium text-white flex-shrink-0">{distribution.high}</span>
            </div>
            <div className="w-full bg-[#1a1a1a] rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${highPct}%`, boxShadow: '0 0 8px #10B981' }}
              ></div>
            </div>
            <div className="text-xs text-[#A1A1AA]">{highPct.toFixed(1)}% of students</div>
          </div>

          {/* Medium Commitment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px #3B82F6)' }} />
                <span className="text-sm text-[#E2E8F0] truncate">Medium Commitment (40-69)</span>
              </div>
              <span className="text-sm font-medium text-white flex-shrink-0">{distribution.medium}</span>
            </div>
            <div className="w-full bg-[#1a1a1a] rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${mediumPct}%`, boxShadow: '0 0 8px #3B82F6' }}
              ></div>
            </div>
            <div className="text-xs text-[#A1A1AA]">{mediumPct.toFixed(1)}% of students</div>
          </div>

          {/* At Risk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} />
                <span className="text-sm text-[#E2E8F0] truncate">At Risk (0-39)</span>
              </div>
              <span className="text-sm font-medium text-white flex-shrink-0">{distribution.atRisk}</span>
            </div>
            <div className="w-full bg-[#1a1a1a] rounded-full h-2.5">
              <div 
                className="bg-yellow-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${atRiskPct}%`, boxShadow: '0 0 8px #F59E0B' }}
              ></div>
            </div>
            <div className="text-xs text-[#A1A1AA]">{atRiskPct.toFixed(1)}% of students</div>
          </div>
        </div>

        {/* At-Risk Students */}
        {atRiskStudents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium text-[#E2E8F0] truncate">At-Risk Students</span>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {atRiskStudents.slice(0, 5).map((student, index) => (
                <div key={student.entityId} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-red-900/20 border border-red-800/40 hover:border-red-700/60 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{student.name}</div>
                    <div className="text-xs text-red-300 line-clamp-1">
                      {student.riskFactors.slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-red-400 flex-shrink-0">
                    {student.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insight */}
        {atRiskStudents.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-red-900/20 border border-red-700/40">
            <div className="text-xs text-red-300 font-medium mb-1">AI Alert</div>
            <div className="text-sm text-red-200 line-clamp-2">
              Flag {atRiskStudents.length} high-risk students who show early abandonment patterns
            </div>
          </div>
        )}

        {/* Total Students */}
        <div className="mt-4 pt-4 border-t border-[#1a1a1a]/50">
          <div className="text-xs text-[#A1A1AA]">
            Based on {totalStudents} students with activity data
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
