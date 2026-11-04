import { colors, textVariants, fontFamilies } from '@odyssey/shared';
import { forwardRef, type ComponentRef } from 'react';
import { Platform, Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

export type TextProps = NativeTextProps & {
  variant?: keyof typeof textVariants;
  color?: keyof Omit<typeof colors, 'neutral' | 'brand'>;
};

export const Text = forwardRef<ComponentRef<typeof NativeText>, TextProps>(function Text({ variant = 'body', color = 'textPrimary', style, ...props }, ref) {
  const family = variant === 'mono' ? fontFamilies.webMono : fontFamilies.webSans;
  return <NativeText ref={ref} {...props} style={[
    textVariants[variant],
    Platform.OS === 'web' && { fontFamily: family },
    { color: colors[color] }, style,
  ]} />;
});
