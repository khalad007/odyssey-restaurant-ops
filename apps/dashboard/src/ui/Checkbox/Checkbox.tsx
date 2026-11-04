import { Ionicons } from '@expo/vector-icons';
import { borderWidths, colors, controls, radii, spacing } from '@odyssey/shared';
import { Platform, Pressable, View, type PressableProps } from 'react-native';
import { Text } from '../Text';
import { type ControlLabel, toggleKeyboardProps, useFocusRing } from '../_internal/interactions';

export type CheckboxProps = Omit<PressableProps, 'children' | 'style' | 'onPress' | 'accessibilityLabel' | 'onFocus' | 'onBlur'> & ControlLabel & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};
export function Checkbox({ checked, onCheckedChange, label, accessibilityLabel, disabled = false, accessibilityState, onPressIn, ...props }: CheckboxProps) {
  const focus = useFocusRing();
  const toggle = () => { if (!disabled) onCheckedChange(!checked); };
  return <Pressable {...props} {...toggleKeyboardProps(toggle, disabled)}
    accessibilityRole="checkbox" accessibilityLabel={accessibilityLabel ?? label}
    accessibilityState={{ ...accessibilityState, disabled, checked }} disabled={disabled} onPress={toggle}
    aria-checked={checked} aria-disabled={disabled}
    onFocus={focus.onFocus} onBlur={focus.onBlur}
    onPressIn={(event) => { focus.onPressIn(event); onPressIn?.(event); }}
    style={[
      { flexDirection: 'row', alignItems: 'center', gap: spacing[2], alignSelf: 'flex-start', opacity: disabled ? controls.opacity.disabled : controls.opacity.enabled },
      Platform.OS === 'web' && controls.focus.webNone,
    ]}
  >
    <View style={[
      { width: controls.checkbox.size, height: controls.checkbox.size, alignItems: 'center', justifyContent: 'center',
        borderWidth: borderWidths.thin, borderColor: checked ? colors.primary : colors.border,
        borderRadius: radii.sm, backgroundColor: checked ? colors.primary : colors.surface },
      !disabled && focus.visible && focus.style,
    ]}>
      {checked ? <Ionicons name="checkmark" size={controls.checkbox.icon} color={colors.primaryText} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" /> : null}
    </View>
    {label ? <Text>{label}</Text> : null}
  </Pressable>;
}
