import { shadowColors } from './colors';

// Web styles use boxShadow; native styles work on iOS and Android.
export const shadows = {
  0: {
    web: { boxShadow: 'none' },
    native: { shadowColor: shadowColors.native, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  },
  1: {
    web: { boxShadow: `0px 1px 3px ${shadowColors.soft}` },
    native: { shadowColor: shadowColors.native, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  },
  2: {
    web: { boxShadow: `0px 2px 8px ${shadowColors.medium}` },
    native: { shadowColor: shadowColors.native, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 4, elevation: 2 },
  },
  3: {
    web: { boxShadow: `0px 4px 16px ${shadowColors.strong}` },
    native: { shadowColor: shadowColors.native, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 },
  },
  4: {
    web: { boxShadow: `0px 8px 24px ${shadowColors.strongest}` },
    native: { shadowColor: shadowColors.native, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 4 },
  },
} as const;
