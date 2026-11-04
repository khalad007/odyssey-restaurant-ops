import { borderWidths, colors, radii, shadows, spacing } from '@odyssey/shared';
import { Platform, View, type ViewProps } from 'react-native';
import { Text } from '../Text';

export type CardProps = ViewProps & { variant?: 'flat' | 'raised' | 'outlined' };
function CardRoot({ variant = 'flat', style, ...props }: CardProps) {
  return <View {...props} style={[
    { backgroundColor: variant === 'raised' ? colors.surfaceRaised : colors.surface,
      borderRadius: radii.lg, borderColor: colors.border,
      borderWidth: variant === 'outlined' ? borderWidths.thin : borderWidths.none },
    variant === 'raised' && (Platform.OS === 'web' ? shadows[2].web : shadows[2].native), style,
  ]} />;
}
function CardHeader({ children, style, ...props }: ViewProps) {
  return <View {...props} style={[
    { padding: spacing[4], borderBottomWidth: borderWidths.thin, borderBottomColor: colors.border }, style,
  ]}>{typeof children === 'string' ? <Text variant="h3">{children}</Text> : children}</View>;
}
function CardBody({ children, style, ...props }: ViewProps) {
  return <View {...props} style={[{ padding: spacing[4], gap: spacing[3] }, style]}>
    {typeof children === 'string' ? <Text>{children}</Text> : children}
  </View>;
}
export const Card = Object.assign(CardRoot, { Header: CardHeader, Body: CardBody });
