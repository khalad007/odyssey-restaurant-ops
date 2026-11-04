import { borderWidths, colors, controls, radii, spacing } from '@odyssey/shared';
import { Platform, Pressable, View, type PressableProps } from 'react-native';
import { Text } from '../Text';
import { type ControlLabel, toggleKeyboardProps, useFocusRing } from '../_internal/interactions';

export type SwitchProps = Omit<PressableProps, 'children' | 'style' | 'onPress' | 'accessibilityLabel' | 'onFocus' | 'onBlur'> & ControlLabel & {
  value: boolean;
  onValueChange: (value: boolean) => void;
};
export function Switch({ value, onValueChange, label, accessibilityLabel, disabled = false, accessibilityState, onPressIn, ...props }: SwitchProps) {
  const focus = useFocusRing();
  const toggle = () => { if (!disabled) onValueChange(!value); };
  return <Pressable {...props} {...toggleKeyboardProps(toggle, disabled)}
    accessibilityRole="switch" accessibilityLabel={accessibilityLabel ?? label}
    accessibilityState={{ ...accessibilityState, disabled, checked: value }} disabled={disabled} onPress={toggle}
    aria-checked={value} aria-disabled={disabled}
    onFocus={focus.onFocus} onBlur={focus.onBlur}
    onPressIn={(event) => { focus.onPressIn(event); onPressIn?.(event); }}
    style={[
      { flexDirection: 'row', alignItems: 'center', gap: spacing[2], alignSelf: 'flex-start', opacity: disabled ? controls.opacity.disabled : controls.opacity.enabled },
      Platform.OS === 'web' && controls.focus.webNone,
    ]}
  >
    <View style={[
      { width: controls.switch.width, height: controls.switch.height, borderRadius: radii.full,
        padding: controls.switch.inset, borderWidth: borderWidths.none,
        backgroundColor: value ? colors.primary : colors.neutral[300], justifyContent: 'center' },
      !disabled && focus.visible && focus.style,
    ]}>
      <View style={{ width: controls.switch.thumb, height: controls.switch.thumb, borderRadius: radii.full,
        backgroundColor: colors.surface, alignSelf: value ? 'flex-end' : 'flex-start' }} />
    </View>
    {label ? <Text>{label}</Text> : null}
  </Pressable>;
}
