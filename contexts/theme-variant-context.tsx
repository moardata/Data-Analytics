/**
 * Theme Variant Context
 * Auto-detects and adapts to Whop's dark/light mode
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeVariant, ThemeColors } from '@/lib/theme-config';
import { getTheme } from '@/lib/theme-config';

interface ThemeVariantContextType {
  variant: ThemeVariant;
  setVariant: (variant: ThemeVariant) => void;
  theme: ThemeColors;
}

const ThemeVariantContext = createContext<ThemeVariantContextType | undefined>(undefined);

export function ThemeVariantProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariantState] = useState<ThemeVariant>('dark');
  const [theme, setTheme] = useState<ThemeColors>(getTheme('dark'));

  // Auto-detect Whop's appearance (dark/light mode)
  useEffect(() => {
    // Check if running in Whop iframe
    const isInWhop = window.self !== window.top;
    
    if (isInWhop) {
      // Listen for Whop theme changes via postMessage
      const handleMessage = (event: MessageEvent) => {
        // Whop sends color theme updates
        if (event.data && typeof event.data === 'object') {
          const appearance = event.data.appearance;
          if (appearance === 'dark' || appearance === 'light') {
            setVariantState(appearance);
            setTheme(getTheme(appearance));
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Request current theme from Whop
      if (window.parent) {
        window.parent.postMessage({ type: 'getColorTheme' }, '*');
      }

      return () => window.removeEventListener('message', handleMessage);
    } else {
      // Fallback: Use system preference if not in Whop
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme: ThemeVariant = prefersDark ? 'dark' : 'light';
      setVariantState(initialTheme);
      setTheme(getTheme(initialTheme));

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme: ThemeVariant = e.matches ? 'dark' : 'light';
        setVariantState(newTheme);
        setTheme(getTheme(newTheme));
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const setVariant = (newVariant: ThemeVariant) => {
    setVariantState(newVariant);
    setTheme(getTheme(newVariant));
  };

  return (
    <ThemeVariantContext.Provider value={{ variant, setVariant, theme }}>
      {children}
    </ThemeVariantContext.Provider>
  );
}

export function useThemeVariant() {
  const context = useContext(ThemeVariantContext);
  if (!context) {
    throw new Error('useThemeVariant must be used within ThemeVariantProvider');
  }
  return context;
}

