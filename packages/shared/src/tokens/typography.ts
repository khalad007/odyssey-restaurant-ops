export const fontFamilies = {
  sans: 'System', mono: 'monospace',
  webSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  webMono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
} as const;
export const fontSizes = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 } as const;
export const fontWeights = { regular: '400', medium: '500', semibold: '600', bold: '700' } as const;
export const lineHeights = { xs: 16, sm: 20, md: 24, lg: 28, xl: 28, '2xl': 32, '3xl': 38, '4xl': 44, '5xl': 56 } as const;

export const textVariants = {
  display: { fontFamily: fontFamilies.sans, fontSize: fontSizes['5xl'], fontWeight: fontWeights.bold, lineHeight: lineHeights['5xl'] },
  h1: { fontFamily: fontFamilies.sans, fontSize: fontSizes['4xl'], fontWeight: fontWeights.bold, lineHeight: lineHeights['4xl'] },
  h2: { fontFamily: fontFamilies.sans, fontSize: fontSizes['3xl'], fontWeight: fontWeights.semibold, lineHeight: lineHeights['3xl'] },
  h3: { fontFamily: fontFamilies.sans, fontSize: fontSizes['2xl'], fontWeight: fontWeights.semibold, lineHeight: lineHeights['2xl'] },
  body: { fontFamily: fontFamilies.sans, fontSize: fontSizes.md, fontWeight: fontWeights.regular, lineHeight: lineHeights.md },
  bodySmall: { fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.regular, lineHeight: lineHeights.sm },
  label: { fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.medium, lineHeight: lineHeights.sm },
  caption: { fontFamily: fontFamilies.sans, fontSize: fontSizes.xs, fontWeight: fontWeights.regular, lineHeight: lineHeights.xs },
  mono: { fontFamily: fontFamilies.mono, fontSize: fontSizes.sm, fontWeight: fontWeights.regular, lineHeight: lineHeights.sm },
} as const;

export const typography = { fontFamilies, fontSizes, fontWeights, lineHeights, variants: textVariants } as const;
