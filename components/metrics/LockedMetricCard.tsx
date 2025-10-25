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
    <Card className="relative rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] overflow-hidden shadow-[0_0_0_1px_rgba(26,26,26,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 to-[#0a0a0a]/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10B981]/10 border-2 border-[#10B981]/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#10B981]" />
          </div>
          <h4 className="text-lg font-bold text-[#F8FAFC] mb-2">Upgrade to Unlock</h4>
          <p className="text-sm text-[#A1A1AA] mb-4">
            This metric requires {requiredTier} plan or higher
          </p>
          <Link href={`/upgrade${queryString}`}>
            <Button className="bg-[#10B981] hover:bg-[#0E9F71] text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Background preview (blurred) */}
      <CardContent className="p-6 opacity-30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">{title}</h3>
            <p className="text-sm text-[#A1A1AA]">{description}</p>
          </div>
          <TrendingUp className="w-5 h-5 text-[#10B981]" />
        </div>
        <div className="h-24 bg-[#1a1a1a]/50 rounded-lg animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

