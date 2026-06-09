// src/lib/terminalTheme.ts
// Terminal aesthetic design system for the Motion pose-coach build.
// Monospace, neon-on-navy, thin glowing borders, scanlines.
//
// NOTE: kept separate from the production `theme.ts` (which the App Store
// build's screens import) so the two design systems don't collide.

export const colors = {
  matrix: '#00FF41',      // primary — real-time / "good"
  navy: '#0A0E27',        // terminal background
  navyRaised: '#10162E',  // raised surfaces / cards
  magenta: '#FF00FF',     // critical alerts & highlights
  amber: '#FFB000',       // warnings / "fix this"
  white: '#E0E6FF',       // primary text
  muted: '#4A5568',       // secondary / disabled
  grid: 'rgba(0,255,65,0.06)',
  scanline: 'rgba(0,255,65,0.03)',
} as const;

// Semantic mapping so screens never hardcode hex.
export const semantic = {
  bg: colors.navy,
  surface: colors.navyRaised,
  text: colors.white,
  textDim: colors.muted,
  good: colors.matrix,
  warn: colors.amber,
  bad: colors.magenta,
  accent: colors.matrix,
} as const;

export const font = {
  // Load these via expo-font in _layout.tsx (see README).
  heading: 'SpaceMono',     // Space Mono
  body: 'JetBrainsMono',    // JetBrains Mono
  alt: 'IBMPlexMono',       // IBM Plex Mono
} as const;

export const space = (n: number) => n * 4; // 4pt grid

export const radius = { sm: 4, md: 8, lg: 12 } as const;

// Glow presets — spread into a style object.
export const glow = (hex: string, intensity = 0.35, blurRadius = 10) => ({
  borderWidth: 1,
  borderColor: hex,
  shadowColor: hex,
  shadowOpacity: intensity,
  shadowRadius: blurRadius,
  shadowOffset: { width: 0, height: 0 },
  elevation: 6, // Android fallback
});

export const type = {
  mono: (size: number, color: string = semantic.text) => ({
    fontFamily: font.body,
    fontSize: size,
    color,
    letterSpacing: 0.5,
  }),
  label: (color: string = semantic.textDim) => ({
    fontFamily: font.alt,
    fontSize: 11,
    color,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  }),
};

export type ThemeColor = keyof typeof colors;
