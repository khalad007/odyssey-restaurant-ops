import type { Customer } from '@odyssey/api-client';
import { Alert, Button, Drawer, Input, Row, Stack } from '../../ui';
import { useCustomerForm } from './useCustomerForm';

export function CustomerFormDrawer({ customer, onClose }: { customer?: Customer; onClose: () => void }) {
  const form = useCustomerForm(customer, onClose);
  return <Drawer open title={customer ? 'Edit customer' : 'New customer'} onClose={() => { if (!form.pending) onClose(); }} footer={<Row><Button variant="secondary" disabled={form.pending} onPress={onClose}>Cancel</Button><Button loading={form.pending} onPress={() => void form.submit()}>Save customer</Button></Row>}><Stack gap={4}>
    {form.error ? <Alert tone="danger" message={form.error} /> : null}
    <Input label="Name" value={form.name} onChangeText={form.setName} disabled={form.pending} autoFocus />
    <Input label="Phone" value={form.phone} onChangeText={form.setPhone} disabled={form.pending} inputMode="tel" />
    <Input label="Email" value={form.email} onChangeText={form.setEmail} disabled={form.pending} inputMode="email" autoCapitalize="none" />
  </Stack></Drawer>;
}
