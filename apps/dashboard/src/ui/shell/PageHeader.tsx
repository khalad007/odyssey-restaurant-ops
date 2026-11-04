import { spacing } from '@odyssey/shared';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '../Text';

export type PageHeaderProps = { title: string; subtitle?: string; actions?: ReactNode };
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing[4] }}>
    <View style={{ gap: spacing[1], flexShrink: 1 }}>
      <Text variant="h1" accessibilityRole="header" aria-level={1}>{title}</Text>
      {subtitle ? <Text color="textSecondary">{subtitle}</Text> : null}
    </View>
    {actions ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing[2] }}>{actions}</View> : null}
  </View>;
}
