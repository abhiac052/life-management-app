export const colors = {
  // Brand — warm orange-red
  primary: '#E8441A',
  primaryDark: '#C23510',
  primaryLight: '#FF6B42',
  primaryGlow: 'rgba(232, 68, 26, 0.10)',
  primaryGlowStrong: 'rgba(232, 68, 26, 0.18)',

  // Accent — amber
  accent: '#FF9500',
  accentLight: 'rgba(255, 149, 0, 0.12)',

  // Semantic
  success: '#1DB954',
  successLight: 'rgba(29, 185, 84, 0.10)',
  warning: '#FF9500',
  warningLight: 'rgba(255, 149, 0, 0.10)',
  error: '#E8441A',
  errorLight: 'rgba(232, 68, 26, 0.10)',
  info: '#0A84FF',
  infoLight: 'rgba(10, 132, 255, 0.10)',

  // Backgrounds — clean white
  background: '#F7F7F8',
  backgroundSecondary: '#EFEFEF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#FFF5F2',

  // Borders
  border: '#E8E8EC',
  borderStrong: '#D0D0D8',
  divider: '#F0F0F4',

  // Text
  text: '#1A1A2E',
  textSecondary: '#6B6B80',
  textDisabled: '#ADADBE',
  textInverse: '#FFFFFF',

  // Misc
  overlay: 'rgba(0,0,0,0.45)',
  white: '#FFFFFF',
  black: '#000000',
};

// Poppins — static weight files, works reliably on Android + iOS
export const fonts = {
  regular:   'Poppins-Regular',
  medium:    'Poppins-Medium',
  semiBold:  'Poppins-SemiBold',
  bold:      'Poppins-Bold',
  extraBold: 'Poppins-ExtraBold',
};

export const typography = {
  h1:        { fontFamily: 'Poppins-ExtraBold', fontSize: 30, lineHeight: 38, letterSpacing: -0.5 },
  h2:        { fontFamily: 'Poppins-Bold',      fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
  h3:        { fontFamily: 'Poppins-SemiBold',  fontSize: 18, lineHeight: 26 },
  body:      { fontFamily: 'Poppins-Regular',   fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: 'Poppins-Regular',   fontSize: 13, lineHeight: 18 },
  label:     { fontFamily: 'Poppins-SemiBold',  fontSize: 11, lineHeight: 16, letterSpacing: 0.4 },
  button:    { fontFamily: 'Poppins-Bold',      fontSize: 15, lineHeight: 20, letterSpacing: 0.2 },
  caption:   { fontFamily: 'Poppins-Regular',   fontSize: 11, lineHeight: 15 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#E8441A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const gradients = {
  primary: ['#E8441A', '#FF6B42'] as const,
  accent: ['#FF9500', '#FFBD00'] as const,
  hero: ['#E8441A', '#C23510'] as const,
};

const theme = { colors, typography, spacing, radius, shadows, gradients };
export default theme;
