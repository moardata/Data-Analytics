'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, TrendingUp, AlertCircle, HelpCircle } from 'lucide-react';

interface PathwayTableProps {
  data: {
    topPathways: Array<{
      sequence: string[] | string;
      completionRate: number;
      studentCount: number;
      avgTimeToComplete?: string;
    }>;
    deadEnds?: Array<{
      experienceId?: string;
      experienceName?: string;
      dropOffRate?: number;
      completionRate?: number;
      studentCount?: number;
    }>;
    powerCombinations?: Array<{
      combination: string[] | string;
      successRate: number;
      frequency?: number;
    }>;
  };
}

export default function PathwayTable({ data }: PathwayTableProps) {
  const { topPathways, deadEnds, powerCombinations } = data;

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
              <h3 className="text-base font-semibold text-[#F8FAFC] truncate">Best Learning Paths</h3>
              <div className="group/info relative">
                <HelpCircle className="h-4 w-4 text-[#A1A1AA] hover:text-[#10B981] cursor-help transition-colors flex-shrink-0" />
                <div className="invisible group-hover/info:visible absolute left-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-[#10B981]/30 rounded-lg shadow-xl z-50">
                  <p className="text-xs text-[#F8FAFC] font-semibold mb-1">Best Learning Paths</p>
                  <p className="text-xs text-[#A1A1AA]">Reveals the content sequences with highest completion rates. Optimize your course structure for maximum student success!</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#A1A1AA] line-clamp-2">What content order works best</p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        </div>

        {/* Top Pathways */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-[#E2E8F0]">Top Pathways</span>
          </div>
          
          {topPathways.length > 0 ? (
            <div className="space-y-3">
              {topPathways.slice(0, 3).map((pathway, index) => {
                // Handle both string and array formats
                const sequence = typeof pathway.sequence === 'string' 
                  ? pathway.sequence.split(' → ')
                  : pathway.sequence;
                
                return (
                  <div key={index} className="p-3 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a] hover:border-[#10B981]/30 transition-all">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0 overflow-x-auto">
                        {sequence && sequence.map ? sequence.map((step, i) => (
                          <React.Fragment key={i}>
                            <span className="text-sm text-white font-medium whitespace-nowrap">{step}</span>
                            {i < sequence.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-[#A1A1AA] flex-shrink-0" />
                            )}
                          </React.Fragment>
                        )) : (
                          <span className="text-sm text-white font-medium truncate">{pathway.sequence}</span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-emerald-400 flex-shrink-0">
                        {pathway.completionRate.toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                      <span>{pathway.studentCount} students</span>
                      <span className="truncate ml-2">{pathway.avgTimeToComplete || 'N/A'} avg.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-[#A1A1AA]">No pathway data yet</div>
              <div className="text-xs text-[#71717A] mt-1">Track student journeys to see content flows</div>
            </div>
          )}
        </div>

        {/* Dead Ends */}
        {deadEnds && deadEnds.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-[#E2E8F0]">Dead Ends</span>
            </div>
            
            <div className="space-y-2">
              {deadEnds.slice(0, 2).map((deadEnd, index) => (
                <div key={index} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-red-900/20 border border-red-800/40 hover:border-red-700/60 transition-all">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-white truncate">{deadEnd.experienceName || deadEnd.experienceId || 'Unknown'}</span>
                  </div>
                  <div className="text-sm font-bold text-red-400 flex-shrink-0 whitespace-nowrap">
                    {deadEnd.dropOffRate ? deadEnd.dropOffRate.toFixed(0) : deadEnd.completionRate ? (100 - deadEnd.completionRate).toFixed(0) : 0}% drop-off
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Power Combinations */}
        {powerCombinations && powerCombinations.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-[#E2E8F0]">Power Combinations</span>
            </div>
            
            <div className="space-y-2">
              {powerCombinations.slice(0, 2).map((combo, index) => {
                // Handle both string and array formats
                const combination = typeof combo.combination === 'string'
                  ? combo.combination.split(' + ')
                  : combo.combination;
                
                return (
                  <div key={index} className="p-2 rounded-xl bg-blue-900/20 border border-blue-800/40 hover:border-blue-700/60 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1 flex-1 min-w-0 overflow-x-auto">
                        {combination && combination.map ? combination.map((item, i) => (
                          <React.Fragment key={i}>
                            <span className="text-xs text-blue-200 whitespace-nowrap">{item}</span>
                            {i < combination.length - 1 && (
                              <span className="text-xs text-blue-400">+</span>
                            )}
                          </React.Fragment>
                        )) : (
                          <span className="text-xs text-blue-200 truncate">{combo.combination}</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-blue-400 flex-shrink-0 whitespace-nowrap">
                        {combo.successRate.toFixed(0)}% success
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Insight */}
        {topPathways.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-900/20 border border-emerald-700/40">
            <div className="text-xs text-emerald-300 font-medium mb-1">AI Insight</div>
            <div className="text-sm text-emerald-200 line-clamp-3">
              Students who take {typeof topPathways[0].sequence === 'string' 
                ? topPathways[0].sequence 
                : topPathways[0].sequence.join(' → ')
              } have {topPathways[0].completionRate.toFixed(0)}% success rates
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
