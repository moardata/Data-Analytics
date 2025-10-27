/**
 * Locked Metric Card
 * Displays upgrade prompt for locked dashboard metrics
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface LockedMetricCardProps {
  title: string;
  description: string;
  requiredTier: string;
}

export default function LockedMetricCard({ title, description, requiredTier }: LockedMetricCardProps) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const queryString = companyId ? `?companyId=${companyId}` : '';

  return (
    <Card className="relative rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] overflow-hidden shadow-lg min-h-[320px] flex items-center justify-center">
      {/* Subtle blur overlay - barely visible */}
      <div className="absolute inset-0 bg-[#0a0a0a]/20 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl p-4">
        {/* Borderless floating upgrade panel */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a]/95 via-[#0f0f0f]/90 to-[#0a0a0a]/95 backdrop-blur-lg p-8 shadow-2xl shadow-black/40 w-full max-w-sm">
          {/* Subtle glow effect */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-b from-[#10B981]/10 via-transparent to-transparent" />
          </div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#10B981]/30 to-[#10B981]/10 flex items-center justify-center shadow-xl shadow-[#10B981]/20">
              <Lock className="w-10 h-10 text-[#10B981]" />
            </div>
            <h4 className="text-xl font-bold text-[#F8FAFC] mb-2">Upgrade to Unlock</h4>
            <p className="text-sm text-[#E2E8F0] mb-1 line-clamp-1">{title}</p>
            <p className="text-xs text-[#A1A1AA] mb-4 line-clamp-2">{description}</p>
            <p className="text-xs text-[#A1A1AA] mb-5">
              Requires <span className="text-[#10B981] font-semibold">{requiredTier}</span> plan
            </p>
            <Link href={`/upgrade${queryString}`}>
              <Button className="w-full bg-gradient-to-r from-[#10B981] to-[#0E9F71] hover:from-[#0E9F71] hover:to-[#10B981] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-[#10B981]/30 transition-all">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Background preview (more visible with blur) */}
      <CardContent className="p-6 opacity-60 absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[#F8FAFC] truncate">{title}</h3>
            <p className="text-sm text-[#A1A1AA] line-clamp-1">{description}</p>
          </div>
          <TrendingUp className="w-5 h-5 text-[#10B981] flex-shrink-0" />
        </div>
        <div className="flex-1 bg-[#1a1a1a]/50 rounded-lg animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

