'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

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
    <Card className="relative rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-400">Content Heat Map</h3>
            <p className="text-xs text-zinc-500">Successful pathways & dead ends</p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>

        {/* Top Pathways */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-zinc-300">Top Pathways</span>
          </div>
          
          {topPathways.length > 0 ? (
            <div className="space-y-3">
              {topPathways.slice(0, 3).map((pathway, index) => {
                // Handle both string and array formats
                const sequence = typeof pathway.sequence === 'string' 
                  ? pathway.sequence.split(' → ')
                  : pathway.sequence;
                
                return (
                  <div key={index} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {sequence && sequence.map ? sequence.map((step, i) => (
                          <React.Fragment key={i}>
                            <span className="text-sm text-white font-medium">{step}</span>
                            {i < sequence.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-zinc-400" />
                            )}
                          </React.Fragment>
                        )) : (
                          <span className="text-sm text-white font-medium">{pathway.sequence}</span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-emerald-400">
                        {(pathway.completionRate * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{pathway.studentCount} students</span>
                      <span>{pathway.avgTimeToComplete || 'N/A'} avg.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-zinc-400">No pathway data yet</div>
              <div className="text-xs text-zinc-500 mt-1">Track student journeys to see content flows</div>
            </div>
          )}
        </div>

        {/* Dead Ends */}
        {deadEnds && deadEnds.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-zinc-300">Dead Ends</span>
            </div>
            
            <div className="space-y-2">
              {deadEnds.slice(0, 2).map((deadEnd, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-red-900/20 border border-red-800/40">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-white">{deadEnd.experienceName || deadEnd.experienceId || 'Unknown'}</span>
                  </div>
                  <div className="text-sm font-bold text-red-400">
                    {deadEnd.dropOffRate ? (deadEnd.dropOffRate * 100).toFixed(0) : deadEnd.completionRate ? ((1 - deadEnd.completionRate) * 100).toFixed(0) : 0}% drop-off
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
              <span className="text-sm font-medium text-zinc-300">Power Combinations</span>
            </div>
            
            <div className="space-y-2">
              {powerCombinations.slice(0, 2).map((combo, index) => {
                // Handle both string and array formats
                const combination = typeof combo.combination === 'string'
                  ? combo.combination.split(' + ')
                  : combo.combination;
                
                return (
                  <div key={index} className="p-2 rounded bg-blue-900/20 border border-blue-800/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {combination && combination.map ? combination.map((item, i) => (
                          <React.Fragment key={i}>
                            <span className="text-xs text-blue-200">{item}</span>
                            {i < combination.length - 1 && (
                              <span className="text-xs text-blue-400">+</span>
                            )}
                          </React.Fragment>
                        )) : (
                          <span className="text-xs text-blue-200">{combo.combination}</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-blue-400">
                        {(combo.successRate * 100).toFixed(0)}% success
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
          <div className="mt-4 p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/40">
            <div className="text-xs text-emerald-300 font-medium mb-1">AI Insight</div>
            <div className="text-sm text-emerald-200">
              Students who take {typeof topPathways[0].sequence === 'string' 
                ? topPathways[0].sequence 
                : topPathways[0].sequence.join(' → ')
              } have {(topPathways[0].completionRate * 100).toFixed(0)}% success rates
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
