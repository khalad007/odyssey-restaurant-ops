import { feedback, spacing } from '@odyssey/shared';
import { useLayoutEffect, useState, type ComponentRef, type ReactNode, type RefObject } from 'react';
import { Modal as NativeModal, Platform, Pressable, View, useWindowDimensions } from 'react-native';

export function SelectPopover({ anchor, label, onClose, children }: {
  anchor: RefObject<ComponentRef<typeof Pressable> | null>; label: string; onClose: () => void; children: ReactNode;
}) {
  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number }>();
  const window = useWindowDimensions();
  useLayoutEffect(() => {
    const measure = () => anchor.current?.measureInWindow((x, y, width, height) => setRect({ x, y, width, height }));
    measure();
    if (Platform.OS !== 'web') return;
    globalThis.window.addEventListener('resize', measure);
    return () => globalThis.window.removeEventListener('resize', measure);
  }, [anchor, window.width, window.height]);
  const below = rect ? window.height - rect.y - rect.height : spacing[0];
  const above = rect ? rect.y : spacing[0];
  const upward = below < feedback.select.maxHeight && above > below;
  const width = Math.min(rect?.width ?? spacing[0], window.width - spacing[8]);
  return <NativeModal visible transparent animationType="none" onRequestClose={onClose} accessibilityLabel={`${label} options`}>
    <View style={{ flex: 1 }}>
      <View aria-hidden accessible={false} testID="select-backdrop"
        {...(Platform.OS === 'web' ? { onPointerUp: onClose } : { onStartShouldSetResponder: () => true, onResponderRelease: onClose })}
        style={{ position: 'absolute', top: spacing[0], right: spacing[0], bottom: spacing[0], left: spacing[0] }} />
      {rect ? <View style={{ position: 'absolute', width,
        left: Math.max(spacing[4], Math.min(rect.x, window.width - width - spacing[4])),
        top: upward ? undefined : rect.y + rect.height + spacing[1], bottom: upward ? window.height - rect.y + spacing[1] : undefined,
        maxHeight: Math.max(spacing[0], (upward ? above : below) - spacing[4]),
      }}>{children}</View> : null}
    </View>
  </NativeModal>;
}
