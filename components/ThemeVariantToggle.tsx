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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                ? 'border-white bg-white/10' 
                : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-16 rounded-md bg-gradient-to-br from-[#4A84D4] via-[#1E3B70] to-[#0B1C33] border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 mix-blend-overlay"></div>
                <div className="absolute top-2 left-2 w-8 h-8 bg-black rounded"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-black" />
                <div className="w-4 h-4 rounded bg-[#1a1a1a]" />
                <div className="w-4 h-4 rounded bg-white" />
              </div>
              <div className="text-sm font-medium text-[#F8FAFC]">Calm Metallic</div>
              <div className="text-xs text-[#A1A1AA]">Black & Blue</div>
            </div>
            {variant === 'variant-b' && (
              <div className="absolute top-2 right-2">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
          </button>

          {/* Frosted Light */}
          <button
            onClick={() => setVariant('frosted-light')}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${variant === 'frosted-light' 
                ? 'border-[#007AFF] bg-[#007AFF]/10' 
                : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-16 rounded-md bg-gradient-to-br from-white to-[#F5F5F7] border border-black/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-[#007AFF]" />
                <div className="w-4 h-4 rounded bg-[#5E5CE6]" />
                <div className="w-4 h-4 rounded bg-[#00C7BE]" />
              </div>
              <div className="text-sm font-medium text-[#F8FAFC]">Frosted Light</div>
              <div className="text-xs text-[#A1A1AA]">Glassy & Clean</div>
            </div>
            {variant === 'frosted-light' && (
              <div className="absolute top-2 right-2">
                <Sparkles className="h-4 w-4 text-[#007AFF]" />
              </div>
            )}
          </button>

          {/* Spectrum Glow */}
          <button
            onClick={() => setVariant('spectrum-glow')}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${variant === 'spectrum-glow' 
                ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' 
                : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-16 rounded-md bg-gradient-to-br from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/50"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-[#8B5CF6]" />
                <div className="w-4 h-4 rounded bg-[#EC4899]" />
                <div className="w-4 h-4 rounded bg-[#06B6D4]" />
              </div>
              <div className="text-sm font-medium text-[#F8FAFC]">Spectrum Glow</div>
              <div className="text-xs text-[#A1A1AA]">Colorful Intent</div>
            </div>
            {variant === 'spectrum-glow' && (
              <div className="absolute top-2 right-2">
                <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
              </div>
            )}
          </button>

          {/* Pro Graphite */}
          <button
            onClick={() => setVariant('pro-graphite')}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${variant === 'pro-graphite' 
                ? 'border-[#A1A1AA] bg-[#A1A1AA]/10' 
                : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-16 rounded-md bg-gradient-to-br from-[#3F3F46] via-[#27272A] to-[#18181B] border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-[#71717A]" />
                <div className="w-4 h-4 rounded bg-[#A1A1AA]" />
                <div className="w-4 h-4 rounded bg-[#D4D4D8]" />
              </div>
              <div className="text-sm font-medium text-[#F8FAFC]">Pro Graphite</div>
              <div className="text-xs text-[#A1A1AA]">Minimal Grey</div>
            </div>
            {variant === 'pro-graphite' && (
              <div className="absolute top-2 right-2">
                <Sparkles className="h-4 w-4 text-[#A1A1AA]" />
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

