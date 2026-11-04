import { borderWidths, colors, layout, spacing } from '@odyssey/shared';
import { ScrollView, View } from 'react-native';
import { Brand } from './Brand';
import { Navigation } from './Navigation';

export function Sidebar() {
  return <View testID="desktop-sidebar" role="complementary" accessibilityLabel="Sidebar" style={{
    width: layout.sidebar.width, flexShrink: 0, backgroundColor: colors.surface,
    borderRightWidth: borderWidths.thin, borderRightColor: colors.border,
  }}>
    <View style={{ minHeight: layout.shell.topBarHeight, justifyContent: 'center', paddingHorizontal: spacing[4], borderBottomWidth: borderWidths.thin, borderBottomColor: colors.border }}><Brand /></View>
    <ScrollView><Navigation /></ScrollView>
  </View>;
}
