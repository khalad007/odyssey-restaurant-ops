import { Ionicons } from '@expo/vector-icons';
import { borderWidths, controls, feedback, radii, spacing } from '@odyssey/shared';
import { View } from 'react-native';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import type { UIAction } from '../_internal/Action';

export type AlertProps = { tone?: keyof typeof feedback.tones; title?: string; message: string; action?: UIAction; onDismiss?: () => void };
const icons = { success: 'checkmark-circle-outline', warning: 'warning-outline', danger: 'alert-circle-outline', info: 'information-circle-outline' } as const;
export function Alert({ tone = 'info', title, message, action, onDismiss }: AlertProps) {
  const palette = feedback.tones[tone];
  const urgent = tone === 'danger' || tone === 'warning';
  return <View role={urgent ? 'alert' : 'status'} aria-live={urgent ? 'assertive' : 'polite'} aria-atomic style={{
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], padding: spacing[4], borderWidth: borderWidths.thin,
    borderColor: palette.color, backgroundColor: palette.subtle, borderRadius: radii.md,
  }}>
    <Ionicons name={icons[tone]} size={controls.button.sizes.md.icon} color={palette.color} aria-hidden />
    <View style={{ flex: 1, gap: spacing[1] }}>
      {title ? <Text variant="label" style={{ color: palette.text }}>{title}</Text> : null}
      <Text style={{ color: palette.text }}>{message}</Text>
      {action ? <Button variant="ghost" onPress={action.onPress} disabled={action.disabled}>{action.label}</Button> : null}
    </View>
    {onDismiss ? <IconButton icon="close" variant="ghost" accessibilityLabel="Dismiss alert" onPress={onDismiss} /> : null}
  </View>;
}
