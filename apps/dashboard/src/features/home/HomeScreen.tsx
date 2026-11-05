import { colors, dashboard, formatCurrencyFromCents, radii, spacing, layout } from '@odyssey/shared';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Card, EmptyState, ErrorState, KpiCard, List, PageHeader, Row, Skeleton, Stack, Text } from '../../ui';
import { useHomeSummary } from './useHomeSummary';

export function HomeScreen() {
  const { summary, pending, customers } = useHomeSummary();
  const router = useRouter();
  const data = summary.data;
  const maxDaily = Math.max(1, ...(data?.ordersPerDay.map((day) => day.orderCount) ?? []));
  const maxPopular = Math.max(1, ...(data?.popularItems.map((item) => item.quantity) ?? []));
  return <>
    <PageHeader title="Home" subtitle="Your restaurant at a glance." />
    {summary.isPending ? <Row style={{ flexWrap: 'wrap' }}>{Array.from({ length: 4 }, (_, index) => <View key={index} style={{ flexGrow: 1, flexBasis: dashboard.kpiWidth }}><Skeleton variant="block" /></View>)}</Row> : summary.isError ? <ErrorState message={summary.error.message ?? 'Unable to load summary.'} onRetry={() => void summary.refetch()} retrying={summary.isFetching} /> : data ? <Row style={{ flexWrap: 'wrap' }}>
      <KpiCard label="Total orders" value={String(data.totalOrders)} /><KpiCard label="Revenue" value={formatCurrencyFromCents(data.revenueCents)} /><KpiCard label="Pending orders" value={String(data.pendingOrders)} /><KpiCard label="Average order value" value={formatCurrencyFromCents(data.averageOrderValueCents)} />
    </Row> : null}
    <Card variant="outlined"><Card.Header>Orders per day</Card.Header><Card.Body><Text variant="caption" color="textSecondary">Last 7 days · UTC calendar dates</Text>
      {summary.isPending ? <Skeleton variant="block" height={dashboard.chartHeight} /> : data?.ordersPerDay.some((day) => day.orderCount > 0) ? <Row align="flex-end" gap={2}>{data.ordersPerDay.map((day) => <Stack key={day.date} gap={2} style={{ flex: 1, minWidth: spacing[0] }}><View accessibilityLabel={`${day.date}: ${day.orderCount} orders`} style={{ height: dashboard.chartHeight, justifyContent: 'flex-end' }}><Text variant="caption">{day.orderCount}</Text><View style={{ height: dashboard.chartHeight * day.orderCount / maxDaily, backgroundColor: colors.primary, borderRadius: radii.sm }} /></View><Text variant="caption">{day.date.slice(5)}</Text></Stack>)}</Row> : summary.isError ? <Text>Summary unavailable. Retry above.</Text> : <EmptyState title="No orders this week" description="Daily order counts will appear here." />}
    </Card.Body></Card>
    <Card variant="outlined"><Card.Header>Popular items</Card.Header><Card.Body>
      {summary.isPending ? <Stack>{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} />)}</Stack> : data?.popularItems.length ? <List>{data.popularItems.slice(0, 5).map((item) => <List.Item key={item.menuItemId} title={item.name} description={`${item.quantity} ordered`} right={<View accessibilityLabel={`${item.quantity} ordered`} style={{ width: dashboard.kpiWidth, maxWidth: layout.sizes.full, height: dashboard.barHeight, backgroundColor: colors.primarySubtle, borderRadius: radii.full }}><View style={{ width: `${item.quantity / maxPopular * 100}%`, height: dashboard.barHeight, backgroundColor: colors.primary, borderRadius: radii.full }} /></View>} />)}</List> : summary.isError ? <Text>Summary unavailable. Retry above.</Text> : <EmptyState title="No popular items yet" description="Item quantities will appear after orders are placed." />}
    </Card.Body></Card>
    <Card variant="outlined"><Card.Header>Pending orders</Card.Header><Card.Body>
      {pending.isPending ? <Stack>{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} variant="block" />)}</Stack> : pending.isError ? <ErrorState message={pending.error.message ?? 'Unable to load pending orders.'} onRetry={() => void pending.refetch()} retrying={pending.isFetching} /> : pending.data?.data.length ? <List>{pending.data.data.map((order) => <List.Item key={order.id} title={`Order ${order.id.slice(0, 8)}`} description={`${customers.data?.find((customer) => customer.id === order.customerId)?.name ?? 'Customer'} · ${formatCurrencyFromCents(order.totalCents)} · ${new Date(order.createdAt).toLocaleString()}`} onPress={() => router.push({ pathname: '/orders', params: { orderId: order.id } })} />)}</List> : <EmptyState title="No pending orders" description="New pending orders will appear here." />}
    </Card.Body></Card>
  </>;
}

