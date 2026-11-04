import { Ionicons } from '@expo/vector-icons';
import { colors, feedback, spacing } from '@odyssey/shared';
import { View } from 'react-native';
import { Button } from '../Button';
import { Text } from '../Text';

export type ErrorStateProps = { message: string; onRetry: () => void; retrying?: boolean };
export function ErrorState({ message, onRetry, retrying = false }: ErrorStateProps) {
  return <View style={{ alignItems: 'center', gap: spacing[3], padding: spacing[8] }}>
    <Ionicons name="alert-circle-outline" size={feedback.empty.iconSize} color={colors.danger} aria-hidden />
    <Text accessibilityRole="alert" color="danger">{message}</Text>
    <Button onPress={onRetry} loading={retrying}>Retry</Button>
  </View>;
}
