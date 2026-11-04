import { feedback, spacing } from '@odyssey/shared';
import type { ReactNode } from 'react';
import { View } from 'react-native';
export type ToastViewportProps = { children: ReactNode; compact: boolean };
export function ToastViewport({ children, compact }: ToastViewportProps) {
  return <View pointerEvents="box-none" style={{ position: 'absolute', top: spacing[4], right: spacing[4], left: compact ? spacing[4] : undefined,
    width: compact ? undefined : feedback.toast.width, gap: spacing[3], zIndex: feedback.toast.zIndex }}>{children}</View>;
}
