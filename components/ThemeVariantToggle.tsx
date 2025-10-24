/**
 * Theme Variant Toggle
 * Allows switching between UI themes for A/B testing
 */

'use client';

import { useThemeVariant } from '@/contexts/theme-variant-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Sparkles } from 'lucide-react';

export function ThemeVariantToggle() {
  const { variant, setVariant } = useThemeVariant();

  return (
    <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Palette className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#F8FAFC]">UI Theme</h3>
            <p className="text-sm text-[#A1A1AA]">Switch between design variants</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Default Theme */}
          <button
            onClick={() => setVariant('default')}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${variant === 'default' 
                ? 'border-[#10B981] bg-[#10B981]/10' 
                : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-16 rounded-md bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] border border-[#1a1a1a]" />
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-[#10B981]" />
                <div className="w-4 h-4 rounded bg-[#8B5CF6]" />
                <div className="w-4 h-4 rounded bg-[#3B82F6]" />
              </div>
              <div className="text-sm font-medium text-[#F8FAFC]">Default</div>
              <div className="text-xs text-[#A1A1AA]">Dark Green</div>
            </div>
            {variant === 'default' && (
              <div className="absolute top-2 right-2">
                <Sparkles className="h-4 w-4 text-[#10B981]" />
              </div>
            )}
          </button>

          {/* Variant B */}
          <button
            onClick={() => setVariant('variant-b')}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${variant === 'variant-b' 
                ? 'border-[#6366F1] bg-[#6366F1]/10' 
                : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-16 rounded-md bg-gradient-to-br from-[#0B0F1A] via-[#1F2937] to-[#111827] border border-[#374151]" />
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-[#6366F1]" />
                <div className="w-4 h-4 rounded bg-[#EC4899]" />
                <div className="w-4 h-4 rounded bg-[#14B8A6]" />
              </div>
              <div className="text-sm font-medium text-[#F8FAFC]">Variant B</div>
              <div className="text-xs text-[#A1A1AA]">Modern Blue</div>
            </div>
            {variant === 'variant-b' && (
              <div className="absolute top-2 right-2">
                <Sparkles className="h-4 w-4 text-[#6366F1]" />
              </div>
            )}
          </button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
          <p className="text-xs text-[#A1A1AA]">
            💡 Your preference is saved and will persist across sessions. 
            Changes apply instantly to all pages.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

