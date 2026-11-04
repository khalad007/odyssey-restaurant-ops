import { borderWidths, colors, controls, feedback, spacing } from '@odyssey/shared';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Text } from '../Text';
import { useFocusRing } from '../_internal/interactions';

export type ListItemProps = { title: string; description?: string; left?: ReactNode; right?: ReactNode; onPress?: () => void; disabled?: boolean };
export function ListItem({ title, description, left, right, onPress, disabled = false }: ListItemProps) {
  const [hovered, setHovered] = useState(false);
  const focus = useFocusRing();
  const content = <>{left}<View style={{ flex: 1, gap: spacing[1] }}><Text variant="label">{title}</Text>{description ? <Text variant="bodySmall" color="textSecondary">{description}</Text> : null}</View>{right}</>;
  const base = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing[3], padding: spacing[4], backgroundColor: hovered ? feedback.hover : colors.surface };
  return <View role="listitem" style={{ borderBottomWidth: borderWidths.thin, borderBottomColor: colors.border }}>
    {onPress ? <Pressable accessibilityRole="button" accessibilityLabel={description ? `${title}. ${description}` : title} disabled={disabled} onPress={onPress}
      onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)} onFocus={focus.onFocus} onBlur={focus.onBlur} onPressIn={focus.onPressIn}
      style={[base, { opacity: disabled ? controls.opacity.disabled : controls.opacity.enabled }, Platform.OS === 'web' && controls.focus.webNone, !disabled && focus.visible && focus.style]}>{content}</Pressable> :
      <View style={base}>{content}</View>}
  </View>;
}
