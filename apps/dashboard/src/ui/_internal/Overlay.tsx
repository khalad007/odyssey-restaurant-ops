import { borderWidths, colors, feedback, layout, radii, shadows, spacing } from '@odyssey/shared';
import { useId, type ReactNode } from 'react';
import { Modal as NativeModal, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { IconButton } from '../IconButton';
import { Row } from '../Row';
import { Text } from '../Text';

export type OverlayProps = { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode };
export function Overlay({ open, onClose, title, children, footer, drawer = false }: OverlayProps & { drawer?: boolean }) {
  const titleId = useId();
  const { width } = useWindowDimensions();
  const compact = width < layout.breakpoints.md;
  return <NativeModal visible={open} transparent animationType="none" onRequestClose={onClose}
    aria-labelledby={titleId} accessibilityLabel={title}>
    {/* NativeModal supplies web focus trapping, Escape handling, and focus restoration. */}
    <View style={{ flex: 1, justifyContent: drawer ? 'flex-start' : 'center', alignItems: drawer ? 'flex-end' : 'center', padding: drawer ? spacing[0] : spacing[4] }}>
      <View testID="overlay-backdrop" {...(Platform.OS === 'web' ? { onPointerUp: onClose } : { onStartShouldSetResponder: () => true, onResponderRelease: onClose })} accessible={false} aria-hidden
        style={{ position: 'absolute', top: spacing[0], right: spacing[0], bottom: spacing[0], left: spacing[0], backgroundColor: feedback.overlay.backdrop }} />
      <View testID={drawer ? 'drawer-panel' : 'modal-panel'} accessibilityViewIsModal style={[
        { backgroundColor: colors.surfaceRaised, borderRadius: drawer ? radii.none : radii.lg,
          width: drawer && compact ? layout.sizes.full : drawer ? feedback.overlay.drawerWidth : layout.sizes.full,
          maxWidth: drawer ? layout.sizes.full : feedback.overlay.modalWidth,
          maxHeight: drawer ? layout.sizes.full : feedback.overlay.maxHeight,
          height: drawer ? layout.sizes.full : undefined },
        Platform.OS === 'web' ? shadows[4].web : shadows[4].native,
      ]}>
        <Row justify="space-between" style={{ padding: spacing[4], borderBottomWidth: borderWidths.thin, borderBottomColor: colors.border }}>
          <Text nativeID={titleId} variant="h3" accessibilityRole="header" style={{ flex: 1 }}>{title}</Text>
          <IconButton icon="close" accessibilityLabel={`Close ${title}`} variant="ghost" onPress={onClose} />
        </Row>
        <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        {footer ? <View style={{ padding: spacing[4], borderTopWidth: borderWidths.thin, borderTopColor: colors.border }}>{footer}</View> : null}
      </View>
    </View>
  </NativeModal>;
}
