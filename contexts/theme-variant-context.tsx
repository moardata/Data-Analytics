/**
 * Theme Variant Context
 * Manages theme switching for A/B testing
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
  const [variant, setVariantState] = useState<ThemeVariant>('default');
  const [theme, setTheme] = useState<ThemeColors>(getTheme('default'));

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme-variant') as ThemeVariant;
    if (saved && (saved === 'default' || saved === 'variant-b')) {
      setVariantState(saved);
      setTheme(getTheme(saved));
    }
  }, []);

  const setVariant = (newVariant: ThemeVariant) => {
    setVariantState(newVariant);
    setTheme(getTheme(newVariant));
    localStorage.setItem('theme-variant', newVariant);
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

