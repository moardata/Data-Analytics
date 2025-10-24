/**
 * Theme Configuration for A/B Testing
 * Switch between different UI themes instantly
 */

export type ThemeVariant = 'default' | 'variant-b' | 'frosted-light' | 'spectrum-glow' | 'pro-graphite';

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
  
  // Variant B (Calm Metallic Gradient - QUITTR inspired)
  'variant-b': {
    bgPrimary: '#0B1C33',
    bgSecondary: '#1E3B70',
    bgTertiary: '#2E4B7F',
    
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    
    textPrimary: '#FFFFFF',
    textSecondary: '#E5E7EB',
    textMuted: '#9CA3AF',
    
    accentPrimary: '#000000',
    accentSecondary: '#1a1a1a',
    accentTertiary: '#2a2a2a',
    
    success: '#000000',
    warning: '#F59E0B',
    error: '#EF6B7B',
    info: '#4A84D4',
    
    glowPrimary: 'rgba(0, 0, 0, 0.6)',
    glowSecondary: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Frosted Light - glassy and OS-inspired
  'frosted-light': {
    bgPrimary: '#F5F5F7',
    bgSecondary: '#FFFFFF',
    bgTertiary: '#FAFAFA',
    
    border: 'rgba(0, 0, 0, 0.08)',
    borderHover: 'rgba(0, 0, 0, 0.12)',
    
    textPrimary: '#1D1D1F',
    textSecondary: '#424245',
    textMuted: '#86868B',
    
    accentPrimary: '#007AFF',
    accentSecondary: '#5E5CE6',
    accentTertiary: '#00C7BE',
    
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    
    glowPrimary: 'rgba(0, 122, 255, 0.3)',
    glowSecondary: 'rgba(94, 92, 230, 0.3)',
  },
  
  // Spectrum Glow - color-intent visual coding
  'spectrum-glow': {
    bgPrimary: '#0A0A0F',
    bgSecondary: '#13131A',
    bgTertiary: '#1C1C26',
    
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
    
    textPrimary: '#FFFFFF',
    textSecondary: '#E4E4E7',
    textMuted: '#A1A1AA',
    
    accentPrimary: '#8B5CF6',
    accentSecondary: '#EC4899',
    accentTertiary: '#06B6D4',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    glowPrimary: 'rgba(139, 92, 246, 0.5)',
    glowSecondary: 'rgba(236, 72, 153, 0.5)',
  },
  
  // Pro Graphite - minimal grayscale with soft contrast
  'pro-graphite': {
    bgPrimary: '#18181B',
    bgSecondary: '#27272A',
    bgTertiary: '#3F3F46',
    
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
    
    textPrimary: '#FAFAFA',
    textSecondary: '#E4E4E7',
    textMuted: '#A1A1AA',
    
    accentPrimary: '#71717A',
    accentSecondary: '#A1A1AA',
    accentTertiary: '#D4D4D8',
    
    success: '#A1A1AA',
    warning: '#D4D4D8',
    error: '#71717A',
    info: '#A1A1AA',
    
    glowPrimary: 'rgba(161, 161, 170, 0.3)',
    glowSecondary: 'rgba(212, 212, 216, 0.3)',
  },
};

export function getTheme(variant: ThemeVariant): ThemeColors {
  return themes[variant];
}

