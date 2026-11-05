import { controls, radii, spacing } from '@odyssey/shared';
import { View, type ViewProps } from 'react-native';
import { Text } from '../Text';

export type BadgeProps = Omit<ViewProps, 'children'> & {
  children: string;
  tone?: keyof typeof controls.tones;
  variant?: 'subtle' | 'dot';
  palette?: { color: string; subtle: string; text: string };
};
export function Badge({ children, tone = 'neutral', variant = 'subtle', palette = controls.tones[tone], style, ...props }: BadgeProps) {
  return <View {...props} style={[
    { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing[1],
      backgroundColor: palette.subtle, borderRadius: radii.full,
      paddingHorizontal: controls.badge.paddingX, paddingVertical: controls.badge.paddingY }, style,
  ]}>
    {variant === 'dot' ? <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{
      width: controls.badge.dot, height: controls.badge.dot, borderRadius: radii.full, backgroundColor: palette.color,
    }} /> : null}
    <Text variant="caption" style={{ color: palette.text }}>{children}</Text>
  </View>;
}
