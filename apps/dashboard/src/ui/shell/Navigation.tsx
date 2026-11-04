import { Ionicons } from '@expo/vector-icons';
import { colors, controls, layout, radii, spacing } from '@odyssey/shared';
import { Link, usePathname } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from '../Text';
import { useFocusRing } from '../_internal/interactions';
import { isNavigationActive, navigationItems } from './navigationItems';
import { LinkPressable } from './LinkPressable';

function NavigationItem({ item, onNavigate }: { item: (typeof navigationItems)[number]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = isNavigationActive(pathname, item.href);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const focus = useFocusRing();
  return <Link href={item.href} asChild onPress={onNavigate}>
    <LinkPressable accessibilityRole="link" accessibilityLabel={item.label} aria-current={active ? 'page' : undefined}
      onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
      onFocus={focus.onFocus} onBlur={focus.onBlur}
      onPressIn={(event) => { setPressed(true); focus.onPressIn(event); }} onPressOut={() => setPressed(false)}
      style={StyleSheet.flatten([
        { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: layout.shell.navItemHeight,
          paddingHorizontal: spacing[3], borderRadius: radii.md,
          backgroundColor: active ? hovered ? colors.brand[100] : colors.primarySubtle : pressed ? colors.neutral[200] : hovered ? colors.neutral[100] : colors.transparent },
        Platform.OS === 'web' && controls.focus.webNone, focus.visible && focus.style,
      ])}>
      <Ionicons name={item.icon} size={controls.button.sizes.md.icon} color={active ? colors.primary : colors.textSecondary} aria-hidden />
      <Text variant="label" color={active ? 'primary' : hovered ? 'textPrimary' : 'textSecondary'}>{item.label}</Text>
    </LinkPressable>
  </Link>;
}
export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return <View role="navigation" accessibilityLabel="Primary navigation" style={{ gap: spacing[1], padding: spacing[2] }}>
    {navigationItems.map((item) => <NavigationItem key={item.href} item={item} onNavigate={onNavigate} />)}
  </View>;
}
