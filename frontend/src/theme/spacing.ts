export const spacing = {
  // Aliases for modern screen code
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,

  // Canonical tokens
  space2xs: 4,
  spaceXs: 8,
  spaceSm: 12,
  spaceMd: 16,
  spaceLg: 20,
  spaceXl: 24,
  space2xl: 32,
  space3xl: 48,

  // Guardrails
  touchMin: 48,
  gutterMobile: 16,
  gutterDesktop: 24,
} as const;

export type Spacing = typeof spacing;
