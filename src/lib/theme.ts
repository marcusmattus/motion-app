// Motion Design System - Dark-First Theme
export const colors = {
  // Primary palette
  primary: '#1E90FF',
  primaryGreen: '#00FF7F',
  accent: '#FF6B35',
  
  // Backgrounds
  background: '#111111',
  card: '#171717',
  surface: '#1E1E1E',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B8C2CC',
  textMuted: '#6B7280',
  
  // Status
  success: '#00FF7F',
  warning: '#FF6B35',
  danger: '#FF4D4F',
  
  // Ring colors (for meter)
  ringOk: '#00FF7F',
  ringWarn: '#FF6B35',
  ringBad: '#FF4D4F',
  
  // Legacy support
  charcoal: '#111111',
  cloud: '#F8F9FA',
  muted: '#B8C2CC',
};

export const gradients = {
  energy: {
    colors: ['#1E90FF', '#00FF7F'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  fire: {
    colors: ['#FF6B35', '#FF4D4F'],
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
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  glow: {
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  glowGreen: {
    shadowColor: '#00FF7F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const typography = {
  headline: 'Montserrat_700Bold',
  headlineMedium: 'Montserrat_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  // Fallbacks
  headlineFallback: 'System',
  bodyFallback: 'System',
};

export const tabBarTheme = {
  backgroundColor: '#111111',
  activeTintColor: '#00FF7F',
  inactiveTintColor: '#B8C2CC',
  borderTopColor: '#1E1E1E',
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
