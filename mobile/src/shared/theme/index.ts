export const lightColors = {
  primary: '#E8441A',
  primaryDark: '#C23510',
  primaryLight: '#FF6B42',
  primaryGlow: 'rgba(232, 68, 26, 0.10)',
  primaryGlowStrong: 'rgba(232, 68, 26, 0.18)',

  accent: '#FF9500',
  accentLight: 'rgba(255, 149, 0, 0.12)',

  success: '#1DB954',
  successLight: 'rgba(29, 185, 84, 0.10)',
  warning: '#FF9500',
  warningLight: 'rgba(255, 149, 0, 0.10)',
  error: '#E8441A',
  errorLight: 'rgba(232, 68, 26, 0.10)',
  info: '#0A84FF',
  infoLight: 'rgba(10, 132, 255, 0.10)',

  background: '#F7F7F8',
  backgroundSecondary: '#EFEFEF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#FFF5F2',

  border: '#E8E8EC',
  borderStrong: '#D0D0D8',
  divider: '#F0F0F4',

  text: '#1A1A2E',
  textSecondary: '#6B6B80',
  textDisabled: '#ADADBE',
  textInverse: '#FFFFFF',

  overlay: 'rgba(0,0,0,0.45)',
  white: '#FFFFFF',
  black: '#000000',

  statusBar: 'dark-content' as 'dark-content' | 'light-content',
};

export const darkColors = {
  primary: '#FF5C2E',
  primaryDark: '#E8441A',
  primaryLight: '#FF7A50',
  primaryGlow: 'rgba(255, 92, 46, 0.15)',
  primaryGlowStrong: 'rgba(255, 92, 46, 0.25)',

  accent: '#FFB340',
  accentLight: 'rgba(255, 179, 64, 0.15)',

  success: '#30D158',
  successLight: 'rgba(48, 209, 88, 0.12)',
  warning: '#FFB340',
  warningLight: 'rgba(255, 179, 64, 0.12)',
  error: '#FF453A',
  errorLight: 'rgba(255, 69, 58, 0.15)',
  info: '#0A84FF',
  infoLight: 'rgba(10, 132, 255, 0.15)',

  background: '#0F0F14',
  backgroundSecondary: '#1A1A24',
  surface: '#1C1C28',
  surfaceElevated: '#252535',
  surfaceHighlight: '#2A1F1A',

  border: '#2C2C3E',
  borderStrong: '#3A3A50',
  divider: '#222230',

  text: '#F0F0FF',
  textSecondary: '#9090A8',
  textDisabled: '#50506A',
  textInverse: '#0F0F14',

  overlay: 'rgba(0,0,0,0.65)',
  white: '#FFFFFF',
  black: '#000000',

  statusBar: 'light-content' as 'dark-content' | 'light-content',
};

export type AppColors = typeof lightColors;

// Default export for static usage (light) — screens using useTheme() will override
export const colors = lightColors;

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
  button:    { fontFamily: 'Poppins-Bold',       fontSize: 15, lineHeight: 20, letterSpacing: 0.2 },
  caption:   { fontFamily: 'Poppins-Regular',   fontSize: 11, lineHeight: 15 },
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
};

export const radius = {
  xs: 4, sm: 8, md: 12, lg: 18, xl: 26, full: 999,
};

export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,  elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  lg: { shadowColor: '#E8441A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 8 },
};

export const gradients = {
  primary: ['#E8441A', '#FF6B42'] as const,
  accent:  ['#FF9500', '#FFBD00'] as const,
  hero:    ['#E8441A', '#C23510'] as const,
};

const theme = { colors, typography, spacing, radius, shadows, gradients };
export default theme;
