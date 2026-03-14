export const Colors = {
  dark: {
    background: {
      default: '#0a0a0a',
      paper: '#111111',
      card: '#1a1a1a',
    },
    primary: '#ffffff',
    secondary: 'rgba(255,255,255,0.6)',
    tertiary: 'rgba(255,255,255,0.35)',
    divider: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.1)',
    surface: '#1a1a1a',
    overlay: 'rgba(0,0,0,0.7)',
  },
  light: {
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
      card: '#eeeeee',
    },
    primary: '#0a0a0a',
    secondary: 'rgba(0,0,0,0.55)',
    tertiary: 'rgba(0,0,0,0.35)',
    divider: 'rgba(0,0,0,0.08)',
    border: 'rgba(0,0,0,0.12)',
    surface: '#f0f0f0',
    overlay: 'rgba(0,0,0,0.5)',
  },
  accent: {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    green: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    pink: '#ec4899',
    teal: '#14b8a6',
  },
}

export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' as const },
  body1: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  body2: { fontSize: 13, fontWeight: '400' as const },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  caption: { fontSize: 12, fontWeight: '400' as const },
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
}

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 999,
}

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
}
