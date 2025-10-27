/**
 * Theme Configuration - Auto-adapts to Whop Dark/Light Mode
 * Automatically detects and matches Whop's appearance
 */

export type ThemeVariant = 'dark' | 'light';

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
  // Dark Mode (Default - Emerald Green)
  dark: {
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
  
  // Light Mode (Clean & Modern)
  light: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F8FAFC',
    bgTertiary: '#F1F5F9',
    
    border: '#E2E8F0',
    borderHover: '#CBD5E1',
    
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    
    accentPrimary: '#10B981',
    accentSecondary: '#8B5CF6',
    accentTertiary: '#3B82F6',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    glowPrimary: 'rgba(16, 185, 129, 0.3)',
    glowSecondary: 'rgba(139, 92, 246, 0.3)',
  },
};

export function getTheme(variant: ThemeVariant): ThemeColors {
  return themes[variant];
}

