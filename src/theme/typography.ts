import { TextStyle, Platform } from 'react-native';

const fontDisplay = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'Plus Jakarta Sans, sans-serif',
});

const fontBody = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'Inter, sans-serif',
});

export const typography = {
  // Aliases for atomic size and font family resolution
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  fontFamilies: {
    regular: fontBody,
    medium: fontBody,
    semiBold: fontBody,
    bold: fontDisplay,
  },

  // Financial Currency Display
  currencyDisplay: {
    fontFamily: fontDisplay,
    fontSize: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  currencyDisplayMobile: {
    fontFamily: fontDisplay,
    fontSize: 26,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 32,
    letterSpacing: -0.5,
  },

  // Headings
  headlineXl: {
    fontFamily: fontDisplay,
    fontSize: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  headlineXlMobile: {
    fontFamily: fontDisplay,
    fontSize: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  headlineLg: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 28,
  },
  headlineMd: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  titleCard: {
    fontFamily: fontDisplay,
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 22,
  },

  // Body & Supporting Information
  bodyLg: {
    fontFamily: fontBody,
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  bodyBase: {
    fontFamily: fontBody,
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  bodyBaseMedium: {
    fontFamily: fontBody,
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontBody,
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  captionBold: {
    fontFamily: fontBody,
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  badgeLabel: {
    fontFamily: fontBody,
    fontSize: 11,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 14,
    letterSpacing: 0.4,
  },
} as const;

export type Typography = typeof typography;
