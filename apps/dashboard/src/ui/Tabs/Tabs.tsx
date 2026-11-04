import { borderWidths, colors, controls, spacing } from '@odyssey/shared';
import { useId, useRef, type ComponentRef, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../Text';
import { useFocusRing } from '../_internal/interactions';

export type TabItem<Value extends string = string> = { value: Value; label: string; disabled?: boolean; content?: ReactNode };
export type TabsProps<Value extends string = string> = { label: string; items: readonly TabItem<Value>[]; value: Value; onValueChange: (value: Value) => void };
function TabButton<Value extends string>({ item, active, id, onSelect, onNavigate, register }: {
  item: TabItem<Value>; active: boolean; id: string; onSelect: () => void;
  onNavigate: (key: string) => void; register: (element: ComponentRef<typeof Pressable> | null) => void;
}) {
  const focus = useFocusRing();
  return <Pressable ref={register} nativeID={`${id}-tab-${item.value}`} role="tab" accessibilityLabel={item.label}
    aria-selected={active} aria-controls={item.content !== undefined ? `${id}-panel-${item.value}` : undefined} aria-disabled={Boolean(item.disabled)}
    tabIndex={active ? 0 : -1} disabled={item.disabled} onPress={onSelect}
    onFocus={focus.onFocus} onBlur={focus.onBlur} onPressIn={focus.onPressIn}
    onKeyDown={(event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.nativeEvent.key)) { event.preventDefault(); onNavigate(event.nativeEvent.key); } }}
    style={({ pressed }) => [
      { paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: borderWidths.medium,
        borderBottomColor: active ? colors.primary : colors.transparent,
        backgroundColor: pressed ? colors.primarySubtle : colors.transparent, opacity: item.disabled ? controls.opacity.disabled : controls.opacity.enabled },
      Platform.OS === 'web' && controls.focus.webNone, focus.visible && focus.style,
    ]}><Text variant="label" color={active ? 'primary' : 'textSecondary'}>{item.label}</Text></Pressable>;
}
export function Tabs<Value extends string>({ label, items, value, onValueChange }: TabsProps<Value>) {
  const id = useId();
  const refs = useRef(new Map<Value, ComponentRef<typeof Pressable>>());
  const enabled = items.filter((item) => !item.disabled);
  const active = enabled.find((item) => item.value === value) ?? enabled[0];
  function navigate(key: string) {
    if (!active) return;
    const index = enabled.findIndex((item) => item.value === active.value);
    const next = key === 'Home' ? 0 : key === 'End' ? enabled.length - 1 : (index + (key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length;
    onValueChange(enabled[next].value);
    refs.current.get(enabled[next].value)?.focus();
  }
  return <View style={{ gap: spacing[4] }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}><View role="tablist" aria-orientation="horizontal" accessibilityLabel={label}
      style={{ flexDirection: 'row', borderBottomWidth: borderWidths.thin, borderBottomColor: colors.border }}>
      {items.map((item) => <TabButton key={item.value} item={item} id={id} active={active?.value === item.value}
        register={(element) => { if (element) refs.current.set(item.value, element); else refs.current.delete(item.value); }}
        onSelect={() => onValueChange(item.value)} onNavigate={navigate} />)}
    </View></ScrollView>
    {items.filter((item) => item.content !== undefined).map((item) => <View key={item.value} nativeID={`${id}-panel-${item.value}`} role="tabpanel"
      aria-labelledby={`${id}-tab-${item.value}`} aria-hidden={active?.value !== item.value}
      style={{ display: active?.value === item.value ? 'flex' : 'none' }}>{item.content}</View>)}
  </View>;
}
