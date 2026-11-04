import { colors, semanticColorVariants } from './colors';
import { spacing } from './spacing';
import { fontSizes } from './typography';

export const feedback = {
  overlay: { backdrop: 'rgba(2, 6, 23, 0.48)', modalWidth: 560, drawerWidth: 480, maxHeight: '90%', zIndex: 1000 },
  select: { maxHeight: 320, zIndex: 100, optionHeight: spacing[10] },
  toast: { width: 420, zIndex: 20000, duration: 5000 },
  skeleton: { textHeight: fontSizes.md, blockHeight: spacing[16], circleSize: spacing[10], minOpacity: 0.45, maxOpacity: 1, pulseDuration: 1200 },
  empty: { iconSize: fontSizes['5xl'] },
  table: { columnFlex: 1 },
  pagination: { siblings: 2 },
  tones: {
    success: semanticColorVariants.success, warning: semanticColorVariants.warning,
    danger: semanticColorVariants.danger, info: semanticColorVariants.info,
  },
  hover: colors.neutral[50],
} as const;
