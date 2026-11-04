import { borderWidths, colors, controls, fontFamilies, radii, spacing, textVariants } from '@odyssey/shared';
import { forwardRef, useId, type ComponentRef, type ReactNode } from 'react';
import { Platform, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { Text } from '../Text';
import { useFocusRing } from './interactions';

export type FieldInputProps = Omit<TextInputProps, 'style' | 'editable'> & {
  label: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};
export const FieldInput = forwardRef<ComponentRef<typeof TextInput>, FieldInputProps>(function FieldInput({
  label, helperText, error, disabled = false, leftAdornment, rightAdornment, style, inputStyle,
  multiline = false, nativeID, onFocus, onBlur, accessibilityLabel, accessibilityHint, ...props
}, ref) {
  const generatedId = useId();
  const id = nativeID ?? generatedId;
  const messageId = error ? `${id}-error` : helperText ? `${id}-helper` : undefined;
  const focus = useFocusRing(true);
  const webProps = Platform.OS === 'web' ? {
    'aria-labelledby': accessibilityLabel ? undefined : `${id}-label`, 'aria-describedby': messageId,
    'aria-invalid': Boolean(error), disabled,
  } : {};
  return <View style={[{ gap: spacing[1], opacity: disabled ? controls.opacity.disabled : controls.opacity.enabled }, style]}>
    <Text nativeID={`${id}-label`} variant="label">{label}</Text>
    <View style={[
      { flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', gap: spacing[2],
        minHeight: multiline ? controls.field.textareaMinHeight : controls.field.height,
        backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: borderWidths.thin,
        borderColor: error ? colors.danger : colors.border,
        paddingHorizontal: controls.field.paddingX, paddingVertical: controls.field.paddingY },
      !disabled && focus.visible && focus.style,
      !disabled && focus.visible && error && (Platform.OS === 'web' ? { outlineColor: colors.danger } : { borderColor: colors.danger }),
    ]}>
      {leftAdornment}
      <TextInput {...props} {...webProps} ref={ref} nativeID={id}
        accessibilityLabel={accessibilityLabel ?? label} accessibilityHint={error ?? helperText ?? accessibilityHint}
        accessibilityState={{ ...props.accessibilityState, disabled }}
        editable={!disabled} multiline={multiline}
        numberOfLines={props.numberOfLines ?? (multiline ? controls.field.textareaLines : undefined)}
        placeholderTextColor={colors.textMuted}
        onFocus={(event) => { focus.onFocus(event); onFocus?.(event); }}
        onBlur={(event) => { focus.onBlur(); onBlur?.(event); }}
        style={[
          textVariants.body,
          { flex: 1, minWidth: spacing[0], color: colors.textPrimary, padding: spacing[0], margin: spacing[0],
            textAlignVertical: multiline ? 'top' : 'center' },
          Platform.OS === 'web' && { ...controls.focus.webNone, fontFamily: fontFamilies.webSans },
          inputStyle,
        ]}
      />
      {rightAdornment}
    </View>
    {error ? <Text nativeID={`${id}-error`} variant="caption" color="danger" accessibilityRole="alert">{error}</Text> :
      helperText ? <Text nativeID={`${id}-helper`} variant="caption" color="textSecondary">{helperText}</Text> : null}
  </View>;
});
