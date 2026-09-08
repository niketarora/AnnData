// Theme Color Palette based on DESIGN_SOURCE.md & Stitch specifications
export const colors = {
  // Brand / Primary Greens
  primary: '#006a36',
  primaryContainer: '#188648',
  primaryDark: '#146B3A',
  primaryLight: '#1F8A4C',
  primaryTint: '#EAF7EF',
  primaryBg: '#EAF7EF',
  primaryFixed: '#93f8ae',

  // Surfaces & Backgrounds
  canvas: '#F7F9F7',
  background: '#F7F9F7',
  backgroundLight: '#ecf6ec',
  surfaceHover: '#e6f1e7',
  surfaceTranslucent: 'rgba(255,255,255,0.85)',
  card: '#FFFFFF',
  surface: '#f2fcf2',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#ecf6ec',
  surfaceContainer: '#e6f1e7',
  surfaceContainerHigh: '#e1ebe1',
  surfaceContainerHighest: '#dbe5db',

  // Typography & Content
  textPrimary: '#17201A',
  textSecondary: '#66736A',
  textTertiary: '#535f59',
  onPrimary: '#ffffff',
  onSurface: '#151e18',
  onSurfaceVariant: '#3f4940',

  // Structural Borders
  border: '#E5EAE6',
  borderLight: '#F0F4F1',
  outline: '#6f7a6f',
  outlineVariant: '#becabd',

  // Status & Semantic Colors
  success: '#1F8A4C',
  successTint: '#EAF7EF',
  successDark: '#146B3A',

  warning: '#D97706',
  warningTint: '#FEF3C7',
  warningDark: '#B45309',
  accentYellow: '#D97706',

  danger: '#DC2626',
  dangerTint: '#FEE2E2',
  dangerDark: '#991B1B',
  error: '#DC2626',
  accentOrange: '#EA580C',

  info: '#2563EB',
  infoTint: '#EFF6FF',
  infoDark: '#1D4ED8',

  // QR / High-contrast accents
  qrDark: '#17201A',
  qrAccent: '#1F8A4C',
} as const;

export type Colors = typeof colors;
