import { Ionicons } from '@expo/vector-icons';
import { colors, controls, layout, radii, spacing } from '@odyssey/shared';
import { Link } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Row } from '../Row';
import { Text } from '../Text';
import { useFocusRing } from '../_internal/interactions';
import { LinkPressable } from './LinkPressable';

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  const focus = useFocusRing();
  return <Link href="/" asChild onPress={onNavigate}><LinkPressable accessibilityRole="link" accessibilityLabel="Odyssey home"
    onFocus={focus.onFocus} onBlur={focus.onBlur} onPressIn={focus.onPressIn}
    style={StyleSheet.flatten([{ borderRadius: radii.md }, Platform.OS === 'web' && controls.focus.webNone, focus.visible && focus.style])}>
    <Row gap={3}>
      <View style={{ width: layout.shell.logoSize, height: layout.shell.logoSize, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="restaurant-outline" size={controls.button.sizes.lg.icon} color={colors.primaryText} aria-hidden />
      </View>
      <View style={{ gap: spacing[0] }}><Text variant="h3">Odyssey</Text><Text variant="caption" color="textMuted">Restaurant operations</Text></View>
    </Row>
  </LinkPressable></Link>;
}
