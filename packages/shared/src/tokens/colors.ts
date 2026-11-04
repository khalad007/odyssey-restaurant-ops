export const neutral = {
  0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
  300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569',
  700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617',
} as const;

export const brand = {
  50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
  400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
  800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
} as const;

export const colors = {
  neutral, brand,
  background: neutral[50], surface: neutral[0], surfaceRaised: neutral[0],
  border: neutral[200], textPrimary: neutral[900], textSecondary: neutral[600], textMuted: neutral[500],
  primary: brand[600], primaryHover: brand[700], primarySubtle: brand[50], primaryText: neutral[0],
  success: '#15803d', successSubtle: '#f0fdf4', successText: '#14532d',
  warning: '#b45309', warningSubtle: '#fffbeb', warningText: '#78350f',
  danger: '#b91c1c', dangerSubtle: '#fef2f2', dangerText: '#7f1d1d',
  info: '#0369a1', infoSubtle: '#f0f9ff', infoText: '#0c4a6e',
  transparent: 'transparent',
} as const;

// Every semantic role has a base color, a subtle background, and paired text.
// Intent text is intended for the subtle background; primaryText is for solid primary.
export const semanticColorVariants = {
  background: { color: colors.background, subtle: neutral[100], text: colors.textPrimary },
  surface: { color: colors.surface, subtle: neutral[50], text: colors.textPrimary },
  surfaceRaised: { color: colors.surfaceRaised, subtle: neutral[100], text: colors.textPrimary },
  border: { color: colors.border, subtle: neutral[100], text: colors.textSecondary },
  textPrimary: { color: colors.textPrimary, subtle: neutral[50], text: colors.textPrimary },
  textSecondary: { color: colors.textSecondary, subtle: neutral[50], text: colors.textSecondary },
  textMuted: { color: colors.textMuted, subtle: neutral[50], text: colors.textMuted },
  primary: { color: colors.primary, subtle: colors.primarySubtle, text: brand[900] },
  primaryHover: { color: colors.primaryHover, subtle: brand[100], text: brand[900] },
  primaryText: { color: colors.primaryText, subtle: colors.primarySubtle, text: brand[900] },
  success: { color: colors.success, subtle: colors.successSubtle, text: colors.successText },
  warning: { color: colors.warning, subtle: colors.warningSubtle, text: colors.warningText },
  danger: { color: colors.danger, subtle: colors.dangerSubtle, text: colors.dangerText },
  info: { color: colors.info, subtle: colors.infoSubtle, text: colors.infoText },
} as const;

export const shadowColors = {
  native: neutral[950],
  soft: 'rgba(2, 6, 23, 0.06)', medium: 'rgba(2, 6, 23, 0.10)',
  strong: 'rgba(2, 6, 23, 0.14)', strongest: 'rgba(2, 6, 23, 0.18)',
} as const;
