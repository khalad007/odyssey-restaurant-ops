import { useOrderingSettings } from './useOrderingSettings';
import { useState } from 'react';
import { NewOrderDrawer } from './NewOrderDrawer';
import { OrderOrderType } from '@odyssey/api-client';
import { formatCurrencyFromCents, orderStatusColors } from '@odyssey/shared';
import { Banner, Badge, Button, EmptyState, ErrorState, Input, PageHeader, Pagination, Modal, Row, Select, Skeleton, Stack, Table, Text } from '../../ui';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import { useOrderDetail } from './useOrderDetail';
import { useOrderTransition } from './useOrderTransition';
import { useOrders } from './useOrders';

export function OrdersScreen() {
  const ordering = useOrderingSettings();
  const orders = useOrders();
  const detail = useOrderDetail();
  const transition = useOrderTransition();
  const [creating, setCreating] = useState(false);
  const data = orders.query.data;
  return <>
    {ordering.paused ? <Banner tone="warning" message="New orders are paused" /> : null}
    <PageHeader title="Orders" subtitle="Track and manage restaurant orders." actions={<Button leftIcon="add" disabled={ordering.paused} accessibilityHint={ordering.paused ? 'New orders are paused' : undefined} onPress={() => setCreating(true)}>New order</Button>} />
    {ordering.paused ? <Text color="textSecondary">Resume accepting orders in Settings to create a new order.</Text> : null}
    <Stack gap={4}>
      <Select label="Status" value={orders.filters.status ?? ''} options={[{ value: '', label: 'All statuses' }, ...Object.keys(orderStatusColors).map((value) => ({ value, label: value }))]} onValueChange={(value) => orders.setFilters({ status: value ? value as keyof typeof orderStatusColors : undefined })} />
      <Select label="Order type" value={orders.filters.orderType ?? ''} options={[{ value: '', label: 'All types' }, ...Object.values(OrderOrderType).map((value) => ({ value, label: value.replaceAll('_', ' ') }))]} onValueChange={(value) => orders.setFilters({ orderType: value ? value as typeof OrderOrderType[keyof typeof OrderOrderType] : undefined })} />
      <Input label="Search orders" placeholder="Search orders or customers" value={orders.search} onChangeText={orders.setSearch} maxLength={200} />
      <Input label="From date" placeholder="YYYY-MM-DD" error={orders.dateError} value={orders.filters.dateFrom ?? ''} onChangeText={(value) => orders.setFilters({ dateFrom: value || undefined })} />
      <Input label="To date" placeholder="YYYY-MM-DD" value={orders.filters.dateTo ?? ''} onChangeText={(value) => orders.setFilters({ dateTo: value || undefined })} />
    </Stack>
    {orders.query.isPending ? <Stack accessibilityLabel="Loading orders">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} variant="block" />)}</Stack> : orders.query.isError ? <ErrorState message={orders.query.error.message ?? 'Unable to load orders.'} onRetry={() => void orders.query.refetch()} retrying={orders.query.isFetching} /> : !data?.data.length ? <EmptyState title="No matching orders" description="Try changing your filters." action={{ label: 'Clear filters', onPress: orders.clear }} /> : <>
      <Table onRowPress={(order) => detail.open(order.id)} label="Orders" rows={data.data} rowKey={(order) => order.id} columns={[
        { key: 'id', header: 'Order', cell: (order) => <Button variant="ghost" size="sm" onPress={() => detail.open(order.id)}>{order.id.slice(0, 8)}</Button> },
        { key: 'customer', header: 'Customer', cell: (order) => orders.customers.data?.find((customer) => customer.id === order.customerId)?.name ?? order.customerId.slice(0, 8) },
        { key: 'type', header: 'Type', cell: (order) => <Badge>{order.orderType.replaceAll('_', ' ')}</Badge> },
        { key: 'status', header: 'Status', cell: (order) => <Badge palette={orderStatusColors[order.status]} variant="dot">{order.status}</Badge> },
        { key: 'total', header: 'Total', cell: (order) => formatCurrencyFromCents(order.totalCents) },
        { key: 'created', header: 'Created', cell: (order) => new Date(order.createdAt).toLocaleString() },
        { key: 'action', header: 'Next action', cell: (order) => order.allowedActions[0] ? <Button size="sm" disabled={transition.mutation.isPending} onPress={() => transition.run(order.id, order.allowedActions[0])}>{order.allowedActions[0].replaceAll('_', ' ')}</Button> : <Text color="textMuted">Final</Text> },
      ]} />
      <Pagination page={orders.page} totalPages={data.totalPages} onPageChange={orders.setPage} />
    </>}
    {creating ? <NewOrderDrawer onClose={() => setCreating(false)} /> : null}
    {detail.id ? <OrderDetailDrawer detail={detail} transition={transition} /> : null}
    <Modal open={Boolean(transition.cancelId)} title="Cancel order?" onClose={transition.closeCancel} footer={<Row><Button variant="secondary" disabled={transition.mutation.isPending} onPress={transition.closeCancel}>Keep order</Button><Button variant="danger" loading={transition.mutation.isPending} onPress={transition.confirmCancel}>Cancel order</Button></Row>}><Text>Cancel this order? This action cannot be undone.</Text></Modal>
  </>;
}




