import { layout, spacing } from '@odyssey/shared';
import { View, useWindowDimensions, type ViewProps } from 'react-native';

export function PageContainer({ style, ...props }: ViewProps) {
  const { width } = useWindowDimensions();
  return <View {...props} style={[
    { width: layout.sizes.full, maxWidth: layout.page.maxWidth, alignSelf: 'center', flexGrow: 1,
      padding: width < layout.breakpoints.md ? spacing[4] : layout.page.padding, gap: spacing[6] }, style,
  ]} />;
}
