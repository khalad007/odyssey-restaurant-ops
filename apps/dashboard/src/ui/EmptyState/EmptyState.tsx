import { Ionicons } from '@expo/vector-icons';
import { colors, feedback, spacing } from '@odyssey/shared';
import type { ComponentProps } from 'react';
import { View } from 'react-native';
import { Action, type UIAction } from '../_internal/Action';
import { Text } from '../Text';

export type EmptyStateProps = { icon?: ComponentProps<typeof Ionicons>['name']; title: string; description?: string; action?: UIAction };
export function EmptyState({ icon = 'file-tray-outline', title, description, action }: EmptyStateProps) {
  return <View style={{ alignItems: 'center', gap: spacing[3], padding: spacing[8] }}>
    <Ionicons name={icon} size={feedback.empty.iconSize} color={colors.textMuted} aria-hidden />
    <Text variant="h3">{title}</Text>
    {description ? <Text color="textSecondary">{description}</Text> : null}
    {action ? <Action {...action} /> : null}
  </View>;
}
