import { feedback, spacing } from '@odyssey/shared';
import { createPortal } from 'react-dom';
import type { ToastViewportProps } from './ToastViewport';
export function ToastViewport({ children, compact }: ToastViewportProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(<div style={{ position: 'fixed', top: spacing[4], right: spacing[4], left: compact ? spacing[4] : undefined,
    width: compact ? undefined : feedback.toast.width, display: 'flex', flexDirection: 'column', gap: spacing[3], zIndex: feedback.toast.zIndex, pointerEvents: 'none' }}>{children}</div>, document.body);
}
