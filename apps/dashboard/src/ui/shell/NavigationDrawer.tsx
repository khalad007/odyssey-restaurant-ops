import { borderWidths, colors, feedback, layout, motion, spacing } from '@odyssey/shared';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal as NativeModal, Platform, View, ScrollView, useWindowDimensions } from 'react-native';
import { IconButton } from '../IconButton';
import { Row } from '../Row';
import { useReducedMotion } from '../_internal/useReducedMotion';
import { Brand } from './Brand';
import { Navigation } from './Navigation';

export function NavigationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(layout.sidebar.width, width - spacing[8]);
  const [visible, setVisible] = useState(open);
  const translate = useRef(new Animated.Value(-layout.sidebar.width)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!open && !visible) { translate.setValue(-panelWidth); return; }
    if (open && !visible) { translate.setValue(-panelWidth); setVisible(true); }
    const animation = Animated.timing(translate, {
      toValue: open ? spacing[0] : -panelWidth, duration: reduced ? motion.durations.none : motion.durations.normal,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start(({ finished }) => { if (finished && !open) setVisible(false); });
    return () => animation.stop();
  }, [open, visible, panelWidth, reduced, translate]);
  return <NativeModal visible={visible} transparent animationType="none" onRequestClose={onClose} accessibilityLabel="Navigation">
    <View style={{ flex: 1 }}>
      <View testID="navigation-backdrop" aria-hidden accessible={false}
        {...(Platform.OS === 'web' ? { onPointerUp: onClose } : { onStartShouldSetResponder: () => true, onResponderRelease: onClose })}
        style={{ position: 'absolute', top: spacing[0], right: spacing[0], bottom: spacing[0], left: spacing[0], backgroundColor: feedback.overlay.backdrop }} />
      <Animated.View nativeID="mobile-navigation" testID="navigation-panel" accessibilityViewIsModal style={{
        width: panelWidth, height: layout.sizes.full, backgroundColor: colors.surface, transform: [{ translateX: translate }],
        borderRightWidth: borderWidths.thin, borderRightColor: colors.border,
      }}>
        <Row justify="space-between" style={{ minHeight: layout.shell.topBarHeight, paddingHorizontal: spacing[3], borderBottomWidth: borderWidths.thin, borderBottomColor: colors.border }}>
          <Brand onNavigate={onClose} />
          <IconButton icon="close" size="sm" variant="ghost" accessibilityLabel="Close navigation" onPress={onClose} />
        </Row>
        <ScrollView><Navigation onNavigate={onClose} /></ScrollView>
      </Animated.View>
    </View>
  </NativeModal>;
}
