import { colors, spacing, library, borderWidths } from '@odyssey/shared';
import type { ReactNode } from 'react';
export function SaveBar({ children }: { children: ReactNode }) { return <div style={{ position: 'sticky', bottom: spacing[0], zIndex: library.navZIndex, padding: spacing[4], background: colors.surface, borderTop: `${borderWidths.thin}px solid ${colors.border}` }}>{children}</div>; }
