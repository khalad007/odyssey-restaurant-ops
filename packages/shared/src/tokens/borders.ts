import { colors } from './colors';

export const borderWidths = { none: 0, thin: 1, medium: 2, thick: 4 } as const;
export const borders = {
  widths: borderWidths,
  default: { borderWidth: borderWidths.thin, borderStyle: 'solid', borderColor: colors.border },
  strong: { borderWidth: borderWidths.medium, borderStyle: 'solid', borderColor: colors.border },
  focus: { borderWidth: borderWidths.medium, borderStyle: 'solid', borderColor: colors.primary },
} as const;
