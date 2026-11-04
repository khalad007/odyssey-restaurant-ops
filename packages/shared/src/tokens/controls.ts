import { colors, neutral, brand, semanticColorVariants } from './colors';
import { spacing } from './spacing';
import { borderWidths } from './borders';
import { fontSizes } from './typography';

export const controls = {
  opacity: { enabled: 1, disabled: 0.5 },
  focus: {
    web: { outlineWidth: borderWidths.medium, outlineOffset: borderWidths.medium, outlineStyle: 'solid', outlineColor: colors.primary },
    webNone: { outlineWidth: borderWidths.none, outlineStyle: 'solid' },
    native: { borderColor: colors.primary, borderWidth: borderWidths.medium },
  },
  button: {
    sizes: {
      sm: { height: spacing[8], padding: spacing[3], icon: fontSizes.md, textVariant: 'label' },
      md: { height: spacing[10], padding: spacing[4], icon: fontSizes.xl, textVariant: 'label' },
      lg: { height: spacing[12], padding: spacing[5], icon: fontSizes['2xl'], textVariant: 'body' },
    },
    variants: {
      primary: { background: colors.primary, hover: colors.primaryHover, pressed: brand[800], foreground: colors.primaryText, border: colors.transparent },
      secondary: { background: colors.surface, hover: neutral[50], pressed: neutral[100], foreground: colors.textPrimary, border: colors.border },
      ghost: { background: colors.transparent, hover: neutral[100], pressed: neutral[200], foreground: colors.textPrimary, border: colors.transparent },
      danger: { background: colors.danger, hover: colors.dangerText, pressed: colors.dangerText, foreground: colors.primaryText, border: colors.transparent },
    },
  },
  field: { height: spacing[10], paddingX: spacing[3], paddingY: spacing[2], textareaMinHeight: spacing[16] * 2, textareaLines: 4 },
  checkbox: { size: spacing[5], icon: fontSizes.md },
  switch: { width: 44, height: spacing[6], thumb: spacing[5], inset: borderWidths.medium },
  badge: { dot: 6, paddingX: spacing[2], paddingY: spacing[1] },
  tones: {
    neutral: { color: neutral[600], subtle: neutral[100], text: neutral[700] },
    success: semanticColorVariants.success, warning: semanticColorVariants.warning,
    danger: semanticColorVariants.danger, info: semanticColorVariants.info,
  },
} as const;
