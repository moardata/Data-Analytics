/**
 * Modern Loading Screen - Purple/Blue/Emerald Theme
 * Standardized loading screen for all pages
 */

'use client';

export function ModernLoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-full blur-3xl opacity-50 animate-pulse" />
      </div>
      
      {/* Loading content */}
      <div className="relative text-center">
        {/* Animated spinner with gradient border */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 blur-md opacity-75 animate-pulse" />
          <div className="relative w-16 h-16 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 animate-spin" style={{
            backgroundClip: 'padding-box',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude'
          }}>
            <div className="absolute inset-1 rounded-full bg-[#0a0a0a]" />
          </div>
        </div>
        
        {/* Loading text */}
        <p className="text-sm font-medium bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}

