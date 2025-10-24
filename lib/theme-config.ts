/**
 * Theme Configuration for A/B Testing
 * Switch between different UI themes instantly
 */

export type ThemeVariant = 'default' | 'variant-b';

export interface ThemeColors {
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  
  // Border colors
  border: string;
  borderHover: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Accent colors
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Glow effects
  glowPrimary: string;
  glowSecondary: string;
}

export const themes: Record<ThemeVariant, ThemeColors> = {
  // Current Design (Dark Green)
  default: {
    bgPrimary: '#0a0a0a',
    bgSecondary: '#0f0f0f',
    bgTertiary: '#1a1a1a',
    
    border: '#1a1a1a',
    borderHover: '#2a2a2a',
    
    textPrimary: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#A1A1AA',
    
    accentPrimary: '#10B981',
    accentSecondary: '#8B5CF6',
    accentTertiary: '#3B82F6',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    glowPrimary: 'rgba(16, 185, 129, 0.6)',
    glowSecondary: 'rgba(139, 92, 246, 0.6)',
  },
  
  // Variant B (Modern Blue/Purple)
  'variant-b': {
    bgPrimary: '#0B0F1A',
    bgSecondary: '#111827',
    bgTertiary: '#1F2937',
    
    border: '#374151',
    borderHover: '#4B5563',
    
    textPrimary: '#F9FAFB',
    textSecondary: '#E5E7EB',
    textMuted: '#9CA3AF',
    
    accentPrimary: '#6366F1',
    accentSecondary: '#EC4899',
    accentTertiary: '#14B8A6',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#F43F5E',
    info: '#06B6D4',
    
    glowPrimary: 'rgba(99, 102, 241, 0.6)',
    glowSecondary: 'rgba(236, 72, 153, 0.6)',
  },
};

export function getTheme(variant: ThemeVariant): ThemeColors {
  return themes[variant];
}

