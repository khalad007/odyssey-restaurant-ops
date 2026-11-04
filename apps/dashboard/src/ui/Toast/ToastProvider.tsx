import { borderWidths, colors, feedback, layout, radii, shadows, spacing } from '@odyssey/shared';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import type { UIAction } from '../_internal/Action';
import { ToastViewport } from './ToastViewport';

export type ToastInput = { tone?: 'success' | 'warning' | 'error' | 'info'; message: string; title?: string; duration?: number; action?: UIAction };
type ToastEntry = ToastInput & { id: string };
type ToastContextValue = { showToast: (toast: ToastInput) => string; dismissToast: (id: string) => void; clearToasts: () => void };
const ToastContext = createContext<ToastContextValue | null>(null);
function ToastItem({ toast, dismiss }: { toast: ToastEntry; dismiss: (id: string) => void }) {
  const [paused, setPaused] = useState(false);
  const duration = toast.duration ?? feedback.toast.duration;
  useEffect(() => {
    if (paused || duration <= 0) return;
    const timer = setTimeout(() => dismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [paused, duration, dismiss, toast.id]);
  const tone = toast.tone === 'error' ? 'danger' : toast.tone ?? 'info';
  const palette = feedback.tones[tone];
  const urgent = tone === 'danger' || tone === 'warning';
  return <View role={urgent ? 'alert' : 'status'} aria-live={urgent ? 'assertive' : 'polite'} aria-atomic pointerEvents="auto"
    onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    style={[
      { padding: spacing[4], gap: spacing[2], borderRadius: radii.md, borderWidth: borderWidths.thin, borderColor: palette.color,
        backgroundColor: colors.surfaceRaised, flexDirection: 'row', alignItems: 'flex-start' },
      Platform.OS === 'web' ? shadows[2].web : shadows[2].native,
    ]}>
    <View style={{ flex: 1, gap: spacing[1] }}>
      {toast.title ? <Text variant="label" style={{ color: palette.text }}>{toast.title}</Text> : null}
      <Text>{toast.message}</Text>
      {toast.action ? <Button variant="ghost" disabled={toast.action.disabled} onPress={() => { toast.action?.onPress(); dismiss(toast.id); }}>{toast.action.label}</Button> : null}
    </View>
    <IconButton icon="close" variant="ghost" accessibilityLabel="Dismiss notification" onPress={() => dismiss(toast.id)} />
  </View>;
}
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);
  const { width } = useWindowDimensions();
  const dismissToast = useCallback((id: string) => setToasts((items) => items.filter((toast) => toast.id !== id)), []);
  const showToast = useCallback((toast: ToastInput) => {
    const id = `toast-${++nextId.current}`;
    setToasts((items) => [...items, { ...toast, id }]);
    return id;
  }, []);
  const clearToasts = useCallback(() => setToasts([]), []);
  const context = useMemo(() => ({ showToast, dismissToast, clearToasts }), [showToast, dismissToast, clearToasts]);
  return <ToastContext.Provider value={context}><View style={{ flex: 1 }}>{children}
    <ToastViewport compact={width < layout.breakpoints.sm}>{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} dismiss={dismissToast} />)}</ToastViewport>
  </View></ToastContext.Provider>;
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
