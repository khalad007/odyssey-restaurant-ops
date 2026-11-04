import { borderWidths, colors, library, radii, spacing } from '@odyssey/shared';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Stack, Text } from '../../ui';

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <View nativeID={id} style={{ gap: spacing[6], paddingVertical: spacing[6], borderBottomWidth: borderWidths.thin, borderBottomColor: colors.border }}>
    <Text variant="h2" accessibilityRole="header" aria-level={2}>{title}</Text>
    {children}
  </View>;
}
export function Grid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] }}>{children}</View>;
}
export function Tile({ title, children }: { title: string; children: ReactNode }) {
  return <Stack gap={3} style={{ flexGrow: 1, flexBasis: library.tileWidth, minWidth: spacing[0], padding: spacing[4], borderWidth: borderWidths.thin, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface }}>
    <Text variant="label">{title}</Text>{children}
  </Stack>;
}
