import { spacing } from '@odyssey/shared';
import { View, type ViewProps, type ViewStyle } from 'react-native';

export type StackProps = ViewProps & {
  gap?: keyof typeof spacing;
  direction?: ViewStyle['flexDirection'];
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
};
export function Stack({ gap = 3, direction = 'column', align, justify, style, ...props }: StackProps) {
  return <View {...props} style={[{ flexDirection: direction, gap: spacing[gap], alignItems: align, justifyContent: justify }, style]} />;
}
