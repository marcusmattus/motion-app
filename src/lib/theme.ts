// Motion Design System — Terminal-Grade Dark Theme
export const colors = {
  // Primary palette — terminal aesthetic
  primary: '#00D4FF',        // Scan blue (replaces dodger blue)
  primaryGreen: '#00FF41',   // Matrix green (replaces mint)
  accent: '#FFB800',         // Amber warning

  // Backgrounds — ultra-dark panels
  background: '#0A0A0A',
  card: '#0F0F0F',
  surface: '#141414',

  // Text
  textPrimary: '#E0E0E0',
  textSecondary: '#8A8A8A',
  textMuted: '#4A4A4A',

  // Status
  success: '#00FF41',
  warning: '#FFB800',
  danger: '#FF2D55',

  // Ring / meter colors
  ringOk: '#00FF41',
  ringWarn: '#FFB800',
  ringBad: '#FF2D55',

  // Terminal specifics
  terminalBorder: '#2A2A2A',
  terminalGreen: '#00FF41',
  terminalBlue: '#00D4FF',
  terminalAmber: '#FFB800',
  scanline: 'rgba(0,255,65,0.03)',

  // Legacy support
  charcoal: '#0A0A0A',
  cloud: '#E0E0E0',
  muted: '#8A8A8A',
};

export const gradients = {
  energy: {
    colors: ['#00D4FF', '#00FF41'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  fire: {
    colors: ['#FFB800', '#FF2D55'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
};

export const shadows = {
  elev1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  glow: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  glowGreen: {
    shadowColor: '#00FF41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const typography = {
  headline: 'SpaceMono',
  headlineMedium: 'SpaceMono',
  body: 'SpaceGrotesk_400Regular',
  bodyMedium: 'SpaceGrotesk_500Medium',
  bodySemiBold: 'SpaceGrotesk_600SemiBold',
  mono: 'SpaceMono',
  // Fallbacks
  headlineFallback: 'monospace',
  bodyFallback: 'System',
};

export const tabBarTheme = {
  backgroundColor: '#0A0A0A',
  activeTintColor: '#00FF41',
  inactiveTintColor: '#4A4A4A',
  borderTopColor: '#2A2A2A',
};

export default {
  colors,
  gradients,
  spacing,
  radius,
  shadows,
  typography,
  tabBarTheme,
};
