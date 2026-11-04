import { colors, controls } from '@odyssey/shared';
import { ActivityIndicator, View } from 'react-native';
import type { TextProps } from '../Text';

export type SpinnerProps = { size?: keyof typeof controls.button.sizes; color?: TextProps['color']; label?: string };
export function Spinner({ size = 'md', color = 'primary', label = 'Loading' }: SpinnerProps) {
  return <View role="progressbar" accessibilityLabel={label} aria-busy>
    <ActivityIndicator size={controls.button.sizes[size].icon} color={colors[color]} accessible={false} aria-hidden />
  </View>;
}
