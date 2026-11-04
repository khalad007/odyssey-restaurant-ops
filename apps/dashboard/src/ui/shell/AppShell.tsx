import { borderWidths, colors, layout, spacing } from '@odyssey/shared';
import { usePathname } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { IconButton } from '../IconButton';
import { Row } from '../Row';
import { Text } from '../Text';
import { NavigationDrawer } from './NavigationDrawer';
import { isNavigationActive, navigationItems } from './navigationItems';
import { PageContainer } from './PageContainer';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const desktop = width >= layout.sidebar.visibleFrom;
  const [navigationOpen, setNavigationOpen] = useState(false);
  useEffect(() => setNavigationOpen(false), [pathname, desktop]);
  const current = navigationItems.find((item) => isNavigationActive(pathname, item.href));
  return <View style={{ flex: 1, flexDirection: desktop ? 'row' : 'column', backgroundColor: colors.background }}>
    {desktop ? <Sidebar /> : <Row justify="space-between" testID="mobile-topbar" style={{
      minHeight: layout.shell.topBarHeight, paddingHorizontal: spacing[4], backgroundColor: colors.surface,
      borderBottomWidth: borderWidths.thin, borderBottomColor: colors.border,
    }}>
      <Row gap={2}><IconButton icon="menu" variant="ghost" accessibilityLabel="Open navigation" aria-expanded={navigationOpen} aria-controls="mobile-navigation" onPress={() => setNavigationOpen(true)} /><Text variant="h3">Odyssey</Text></Row>
      <Text variant="label" color="textSecondary">{current?.label}</Text>
    </Row>}
    <View role="main" accessibilityLabel="Page content" style={{ flex: 1, minWidth: spacing[0] }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <PageContainer>{children}</PageContainer>
      </ScrollView>
    </View>
    <NavigationDrawer open={!desktop && navigationOpen} onClose={() => setNavigationOpen(false)} />
  </View>;
}
