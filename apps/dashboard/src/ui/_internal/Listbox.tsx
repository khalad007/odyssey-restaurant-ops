import type { ReactNode } from 'react';
import { View } from 'react-native';
export type ListboxProps = { id: string; label: string; children: ReactNode };
export function Listbox({ id, label, children }: ListboxProps) {
  return <View nativeID={id} accessibilityRole="list" accessibilityLabel={label}>{children}</View>;
}
