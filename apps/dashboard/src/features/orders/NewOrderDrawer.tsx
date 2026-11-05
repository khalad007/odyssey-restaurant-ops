import { CreateOrderBodyOrderType } from '@odyssey/api-client';
import { formatCurrencyFromCents } from '@odyssey/shared';
import { Alert, Button, Drawer, ErrorState, IconButton, Row, Select, Skeleton, Stack, Text, Textarea } from '../../ui';
import { useCreateOrderForm } from './useCreateOrderForm';

export function NewOrderDrawer({ onClose }: { onClose: () => void }) {
  const form = useCreateOrderForm(onClose);
  const loading = form.customers.isPending || form.menu.isPending;
  const failed = form.customers.isError || form.menu.isError;
  return <Drawer open title="New order" onClose={() => { if (!form.pending) onClose(); }} footer={<Row><Button variant="secondary" disabled={form.pending} onPress={onClose}>Cancel</Button><Button loading={form.pending} disabled={loading || failed} onPress={() => void form.submit()}>Create order</Button></Row>}>
    {loading ? <Skeleton variant="block" /> : failed ? <ErrorState message="Unable to load customers or menu items." onRetry={() => { void form.customers.refetch(); void form.menu.refetch(); }} /> : <Stack gap={5}>
      {form.error ? <Alert tone="danger" title="Could not create order" message={form.error} /> : null}
      <Select label="Customer" value={form.customerId} options={(form.customers.data ?? []).map((customer) => ({ value: customer.id, label: customer.name }))} onValueChange={form.setCustomerId} disabled={form.pending} />
      <Select label="Order type" value={form.orderType} options={Object.values(CreateOrderBodyOrderType).map((value) => ({ value, label: value.replaceAll('_', ' ') }))} onValueChange={form.setOrderType} disabled={form.pending} />
      <Textarea label="Notes" value={form.notes} onChangeText={form.setNotes} disabled={form.pending} />
      <Select label="Add menu item" options={form.available.map((item) => ({ value: item.id, label: `${item.name} · ${formatCurrencyFromCents(item.priceCents)}` }))} onValueChange={form.add} disabled={form.pending} />
      {!form.available.length ? <Text>No menu items are currently available.</Text> : null}
      {form.items.map((line) => <Stack key={line.menuItemId}><Text>{form.available.find((item) => item.id === line.menuItemId)?.name ?? 'Unavailable item'}</Text><Row><IconButton icon="remove" accessibilityLabel={`Decrease quantity ${line.menuItemId}`} disabled={form.pending || line.quantity <= 1} onPress={() => form.quantity(line.menuItemId, -1)} /><Text accessibilityLabel="Quantity">{line.quantity}</Text><IconButton icon="add" accessibilityLabel={`Increase quantity ${line.menuItemId}`} disabled={form.pending} onPress={() => form.quantity(line.menuItemId, 1)} /><Button variant="ghost" disabled={form.pending} onPress={() => form.remove(line.menuItemId)}>Remove</Button></Row></Stack>)}
      <Text variant="label">Estimated total (final total is calculated by the server)</Text><Text variant="h3">{formatCurrencyFromCents(form.estimated)}</Text>
    </Stack>}
  </Drawer>;
}
