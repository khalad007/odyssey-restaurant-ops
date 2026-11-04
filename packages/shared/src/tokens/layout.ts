import { spacing } from './spacing';

export const breakpoints = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
export const layout = {
  breakpoints,
  sizes: { full: '100%', auto: 'auto' },
  sidebar: { width: 256, collapsedWidth: 72, visibleFrom: breakpoints.lg },
  shell: { topBarHeight: spacing[16], navItemHeight: 44, logoSize: spacing[10] },
  page: { maxWidth: 1440, padding: spacing[6] },
  grid: {
    columns: { base: 4, md: 8, lg: 12 },
    gutters: { base: spacing[4], md: spacing[6], lg: spacing[8] },
  },
} as const;
