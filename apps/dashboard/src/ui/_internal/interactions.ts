import { useContext, useState } from 'react';
import { InteractionPreview } from './InteractionPreview';
import { Platform, type PressableProps } from 'react-native';
import { controls } from '@odyssey/shared';

export function useFocusRing(always = false) {
  const [visible, setVisible] = useState(false);
  const preview = useContext(InteractionPreview);
  return {
    visible: visible || preview === 'focus',
    style: Platform.OS === 'web' ? controls.focus.web : controls.focus.native,
    onFocus: (event: { target: unknown }) => {
      const target = event.target as Element | null;
      setVisible(always || Platform.OS !== 'web' || target?.matches?.(':focus-visible') === true);
    },
    onBlur: () => setVisible(false),
    onPressIn: (event: { nativeEvent: unknown }) => {
      const source = event.nativeEvent as { type?: string };
      if (Platform.OS === 'web' && !source.type?.startsWith('key')) setVisible(false);
    },
  };
}

export function toggleKeyboardProps(toggle: () => void, disabled: boolean) {
  return Platform.OS === 'web' ? {
    onKeyDown: ((event) => {
      // RN Web's Pressable handles Enter; checkbox/switch roles also need Space.
      if (event.nativeEvent.key === ' ') {
        event.preventDefault();
        if (!disabled && !('repeat' in event.nativeEvent && event.nativeEvent.repeat)) toggle();
      }
    }) satisfies NonNullable<PressableProps['onKeyDown']>,
  } : {};
}

export type ControlLabel = { label: string; accessibilityLabel?: string } | { label?: string; accessibilityLabel: string };
