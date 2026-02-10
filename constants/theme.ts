// Theme configuration - Modern Tech 3D Style
import { useColorScheme } from 'react-native';

const Palette = {
  // Brand Base
  purple: '#8B1E5E',
  green: '#8DBA35',

  // Tech/Neon Accents
  neonPurple: '#D946EF', // Fuschia for glow
  neonGreen: '#A3E635', // Lime for glow
  cyan: '#06B6D4',       // Tech interface blue

  // Dark Tech Backgrounds
  midnight: '#0F172A',
  deepSpace: '#020617',

  // Neutrals
  white: '#FFFFFF',
  grey50: '#F8FAFC',
  grey100: '#E2E8F0',
  grey200: '#94A3B8',
  grey800: '#1E293B',
  grey900: '#0F172A',
};

export const DarkColors = {
  primary: Palette.neonPurple, // Pop!
  primaryLight: Palette.purple,
  accent: Palette.neonGreen,   // Pop!

  background: Palette.deepSpace,
  surface: 'rgba(30, 41, 59, 0.7)', // Glassmorphism dark

  text: Palette.white,
  textSecondary: Palette.grey200,
  textMuted: '#64748B',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Exposed Palette
  white: Palette.white,
  grey50: Palette.grey50,
  grey100: Palette.grey100,
  grey200: Palette.grey200,
  grey800: Palette.grey800,
  info: Palette.cyan,

  // 3D Shadows (Glows for dark mode)
  shadowLight: 'rgba(255, 255, 255, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
};

// Force Dark Tech Theme
export const Colors = DarkColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 12,
  md: 20,
  lg: 32,
  xl: 40,
  round: 999,
};

export const Shadows = {
  // Neon Glow effects for Tech feel
  soft: {
    shadowColor: Palette.neonPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  medium: {
    shadowColor: Palette.cyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  strong: {
    shadowColor: Palette.neonGreen,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
