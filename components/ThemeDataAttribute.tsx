/**
 * Theme Data Attribute Component
 * Adds data-theme-variant attribute to HTML element for CSS targeting
 */

'use client';

import { useEffect } from 'react';
import { useThemeVariant } from '@/contexts/theme-variant-context';

export function ThemeDataAttribute() {
  const { variant } = useThemeVariant();

  useEffect(() => {
    // Add data attribute to HTML element
    document.documentElement.setAttribute('data-theme-variant', variant);

    // Cleanup
    return () => {
      document.documentElement.removeAttribute('data-theme-variant');
    };
  }, [variant]);

  return null; // This component doesn't render anything
}

