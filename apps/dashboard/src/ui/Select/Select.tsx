import { Ionicons } from '@expo/vector-icons';
import { borderWidths, colors, controls, feedback, radii, shadows, spacing } from '@odyssey/shared';
import { useCallback, useEffect, useId, useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View, type PressableProps } from 'react-native';
import { IconButton } from '../IconButton';
import { Input } from '../Input';
import { Text } from '../Text';
import { useFocusRing } from '../_internal/interactions';
import { Listbox } from '../_internal/Listbox';
import { SelectPopover } from '../_internal/SelectPopover';

export type SelectOption<Value extends string = string> = { value: Value; label: string; disabled?: boolean };
export type SelectProps<Value extends string = string> = {
  label: string; value?: Value; onValueChange: (value: Value) => void;
  options: readonly SelectOption<Value>[]; placeholder?: string; error?: string; helperText?: string; disabled?: boolean;
};
export function Select<Value extends string>({ label, value, onValueChange, options, placeholder = 'Select an option', error, helperText, disabled = false }: SelectProps<Value>) {
  const id = useId();
  const trigger = useRef<ComponentRef<typeof Pressable>>(null);
  const search = useRef<ComponentRef<typeof TextInput>>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState<Value>();
  const focus = useFocusRing();
  const visible = options.filter((option) => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const enabled = visible.filter((option) => !option.disabled);
  const active = enabled.find((option) => option.value === highlighted) ?? enabled[0];
  const selected = options.find((option) => option.value === value);
  const close = useCallback(() => { setOpen(false); setQuery(''); setHighlighted(undefined); trigger.current?.focus(); }, []);
  const choose = (option: SelectOption<Value>) => { if (!option.disabled) { onValueChange(option.value); close(); } };
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useEffect(() => {
    if (!open || disabled) return;
    search.current?.focus();
  }, [open, disabled, close]);
  useEffect(() => {
    if (open && active && Platform.OS === 'web') document.getElementById(`${id}-option-${visible.findIndex((option) => option.value === active.value)}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id, visible]);
  const keyHandler: NonNullable<PressableProps['onKeyDown']> = (event) => {
    if (!disabled && ['ArrowDown', 'ArrowUp'].includes(event.nativeEvent.key)) { event.preventDefault(); setOpen(true); }
  };
  return <View style={{ gap: spacing[1] }}>
    <Text nativeID={`${id}-label`} variant="label">{label}</Text>
    <Pressable ref={trigger} role="combobox" accessibilityLabel={label} aria-expanded={open && !disabled}
      aria-controls={`${id}-list`} aria-haspopup="dialog" aria-invalid={Boolean(error)}
      aria-describedby={error || helperText ? `${id}-message` : undefined} disabled={disabled}
      onPress={() => open ? close() : setOpen(true)} onKeyDown={keyHandler}
      onFocus={focus.onFocus} onBlur={focus.onBlur} onPressIn={focus.onPressIn}
      style={[
        { minHeight: controls.field.height, paddingHorizontal: controls.field.paddingX, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          borderWidth: borderWidths.thin, borderColor: error ? colors.danger : colors.border, borderRadius: radii.md, backgroundColor: colors.surface,
          opacity: disabled ? controls.opacity.disabled : controls.opacity.enabled },
        Platform.OS === 'web' && controls.focus.webNone, !disabled && focus.visible && focus.style,
      ]}>
      <Text color={selected ? 'textPrimary' : 'textMuted'}>{selected?.label ?? placeholder}</Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={controls.button.sizes.md.icon} color={colors.textMuted} aria-hidden />
    </Pressable>
    {error || helperText ? <Text nativeID={`${id}-message`} variant="caption" color={error ? 'danger' : 'textSecondary'} accessibilityRole={error ? 'alert' : undefined}>{error ?? helperText}</Text> : null}
    {open && !disabled ? <SelectPopover anchor={trigger} label={label} onClose={close}><View style={[
      { flexShrink: 1, padding: spacing[2], gap: spacing[2], borderWidth: borderWidths.thin,
        borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surfaceRaised, zIndex: feedback.select.zIndex },
      Platform.OS === 'web' ? shadows[2].web : shadows[2].native,
    ]}>
      <Input ref={search} autoFocus label={`Search ${label}`} placeholder="Search…" value={query} onChangeText={(text) => { setQuery(text); setHighlighted(undefined); }}
        aria-controls={`${id}-list`} aria-activedescendant={active ? `${id}-option-${visible.findIndex((option) => option.value === active.value)}` : undefined}
        rightAdornment={<IconButton icon="close" variant="ghost" size="sm" accessibilityLabel={`Close ${label} options`} onPress={close} />}
        onKeyPress={(event) => {
          const key = event.nativeEvent.key;
          if (key === 'Escape') { event.preventDefault(); if (Platform.OS !== 'web') close(); return; }
          if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter'].includes(key)) return;
          event.preventDefault();
          if (!enabled.length) return;
          if (key === 'Enter') { if (active) choose(active); return; }
          const index = enabled.findIndex((option) => option.value === active?.value);
          const next = key === 'Home' ? 0 : key === 'End' ? enabled.length - 1 : (index + (key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
          setHighlighted(enabled[next].value);
        }} />
      <ScrollView style={{ maxHeight: feedback.select.maxHeight, flexShrink: 1 }} keyboardShouldPersistTaps="handled">
        <Listbox id={`${id}-list`} label={`${label} options`}>
          {visible.map((option, index) => <Pressable key={option.value} nativeID={`${id}-option-${index}`} role="option" tabIndex={-1}
            accessibilityLabel={option.label} aria-selected={value === option.value} aria-disabled={Boolean(option.disabled)} disabled={option.disabled}
            onPress={() => choose(option)} onHoverIn={() => { if (!option.disabled) setHighlighted(option.value); }}
            style={{ minHeight: feedback.select.optionHeight, padding: spacing[2], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: active?.value === option.value ? colors.primarySubtle : colors.transparent,
              opacity: option.disabled ? controls.opacity.disabled : controls.opacity.enabled }}>
            <Text>{option.label}</Text>
            {value === option.value ? <Ionicons name="checkmark" size={controls.button.sizes.sm.icon} color={colors.primary} aria-hidden /> : null}
          </Pressable>)}
          {!visible.length ? <Text color="textMuted">No options found.</Text> : null}
        </Listbox>
      </ScrollView>
    </View></SelectPopover> : null}
  </View>;
}
