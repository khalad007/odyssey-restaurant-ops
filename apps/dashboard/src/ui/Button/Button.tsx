import { Ionicons } from '@expo/vector-icons';
import { borderWidths, controls, radii, spacing } from '@odyssey/shared';
import { forwardRef, useContext, useState, type ComponentProps, type ComponentRef } from 'react';
import { InteractionPreview } from '../_internal/InteractionPreview';
import { ActivityIndicator, Platform, Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../Text';
import { useFocusRing } from '../_internal/interactions';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: string;
  variant?: keyof typeof controls.button.variants;
  size?: keyof typeof controls.button.sizes;
  loading?: boolean;
  leftIcon?: ComponentProps<typeof Ionicons>['name'];
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Button = forwardRef<ComponentRef<typeof View>, ButtonProps>(function Button({
  children, variant = 'primary', size = 'md', loading = false, disabled = false,
  leftIcon, iconOnly = false, style, onFocus, onBlur, onHoverIn, onHoverOut, onPressIn,
  accessibilityLabel, accessibilityState, ...props
}, ref) {
  const [hovered, setHovered] = useState(false);
  const preview = useContext(InteractionPreview);
  const focus = useFocusRing();
  const blocked = disabled || loading;
  const palette = controls.button.variants[variant];
  const dimensions = controls.button.sizes[size];
  return (
    <Pressable
      {...props} ref={ref} accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityState={{ ...accessibilityState, disabled: blocked, busy: loading }}
      aria-busy={loading} aria-disabled={blocked}
      disabled={blocked}
      onFocus={(event) => { focus.onFocus(event); onFocus?.(event); }}
      onBlur={(event) => { focus.onBlur(); onBlur?.(event); }}
      onPressIn={(event) => { focus.onPressIn(event); onPressIn?.(event); }}
      onHoverIn={(event) => { setHovered(true); onHoverIn?.(event); }}
      onHoverOut={(event) => { setHovered(false); onHoverOut?.(event); }}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2],
          minHeight: dimensions.height, width: iconOnly ? dimensions.height : undefined,
          paddingHorizontal: iconOnly ? spacing[0] : dimensions.padding,
          borderRadius: radii.md, borderWidth: borderWidths.thin, borderColor: palette.border,
          backgroundColor: !blocked && (pressed || preview === 'pressed') ? palette.pressed : !blocked && (hovered || preview === 'hover') ? palette.hover : palette.background,
          opacity: blocked ? controls.opacity.disabled : controls.opacity.enabled },
        Platform.OS === 'web' && controls.focus.webNone,
        style, !blocked && focus.visible && focus.style,
      ]}
    >
      {loading ? <ActivityIndicator accessibilityLabel="Loading" size={dimensions.icon} color={palette.foreground} /> :
        leftIcon ? <Ionicons name={leftIcon} size={dimensions.icon} color={palette.foreground} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" /> : null}
      {!iconOnly ? <Text variant={dimensions.textVariant} style={{ color: palette.foreground }}>{children}</Text> : null}
    </Pressable>
  );
});
