import { formatCurrencyFromCents, orderStatusColors } from '@odyssey/shared';
import { Badge, Button, Drawer, ErrorState, Row, Skeleton, Stack, Table, Text } from '../../ui';
import type { useOrderDetail } from './useOrderDetail';
import type { useOrderTransition } from './useOrderTransition';

export function OrderDetailDrawer({ detail, transition }: { detail: ReturnType<typeof useOrderDetail>; transition: ReturnType<typeof useOrderTransition> }) {
  const order = detail.query.data;
  return <Drawer open title={`Order ${detail.id.slice(0, 8)}`} onClose={detail.close} footer={order ? <Row style={{ flexWrap: 'wrap' }}>{order.allowedActions.map((action) => <Button key={action} variant={action === 'cancel' ? 'danger' : 'primary'} disabled={transition.mutation.isPending} onPress={() => transition.run(order.id, action)}>{action.replaceAll('_', ' ')}</Button>)}</Row> : undefined}>
    {detail.query.isPending ? <Stack><Skeleton /><Skeleton variant="block" /></Stack> : detail.query.isError ? <ErrorState message={detail.query.error.message ?? 'Unable to load order.'} onRetry={() => void detail.query.refetch()} /> : order ? <Stack gap={5}>
      <Badge palette={orderStatusColors[order.status]}>{order.status}</Badge>
      <Text variant="h3">{order.customer.name}</Text><Text>{[order.customer.phone, order.customer.email].filter(Boolean).join(' · ')}</Text>
      <Text>Type: {order.orderType.replaceAll('_', ' ')}</Text><Text>Created: {new Date(order.createdAt).toLocaleString()}</Text>
      <Text>Notes: {order.notes || 'None'}</Text>
      <Table label="Order line items" rows={order.items} rowKey={(item) => item.id} columns={[
        { key: 'name', header: 'Item', cell: (item) => item.nameSnapshot },
        { key: 'quantity', header: 'Quantity', cell: (item) => item.quantity },
        { key: 'unit', header: 'Unit price', cell: (item) => formatCurrencyFromCents(item.unitPriceCentsSnapshot) },
        { key: 'total', header: 'Line total', cell: (item) => formatCurrencyFromCents(item.quantity * item.unitPriceCentsSnapshot) },
      ]} />
      <Text>Subtotal: {formatCurrencyFromCents(order.subtotalCents)}</Text><Text variant="h3">Total: {formatCurrencyFromCents(order.totalCents)}</Text>
    </Stack> : null}
  </Drawer>;
}
