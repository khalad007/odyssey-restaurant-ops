import type { Customer } from '@odyssey/api-client';
import { formatCurrencyFromCents } from '@odyssey/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Drawer, EmptyState, ErrorState, Input, KpiCard, List, PageHeader, Row, Skeleton, Stack, Table, Text } from '../../ui';
import { CustomerFormDrawer } from './CustomerFormDrawer';
import { useCustomers } from './useCustomers';
import { useCustomerDetail } from './useCustomerDetail';

export function CrmScreen() {
  const customers = useCustomers();
  const detail = useCustomerDetail();
  const [editor, setEditor] = useState<{ customer?: Customer }>();
  const router = useRouter();
  const customer = detail.query.data;
  return <>
    <PageHeader title="CRM" subtitle="Customer contacts and order history." actions={<Button leftIcon="add" onPress={() => setEditor({})}>New customer</Button>} />
    <Input label="Search customers" value={customers.search} onChangeText={customers.setSearch} placeholder="Name, phone, or email" />
    {customers.query.isPending ? <Stack>{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} variant="block" />)}</Stack> : customers.query.isError ? <ErrorState message={customers.query.error.message ?? 'Unable to load customers.'} onRetry={() => void customers.query.refetch()} retrying={customers.query.isFetching} /> : !customers.rows.length ? <EmptyState title="No customers found" action={customers.search ? { label: 'Clear search', onPress: () => customers.setSearch('') } : { label: 'New customer', onPress: () => setEditor({}) }} /> : <Table label="Customers" rows={customers.rows} rowKey={(row) => row.id} onRowPress={(row) => detail.open(row.id)} sort={customers.sort} onSort={customers.setSort} columns={[
      { key: 'name', header: 'Name', sortable: true, cell: (row) => <Button variant="ghost" size="sm" onPress={() => detail.open(row.id)}>{row.name}</Button> },
      { key: 'phone', header: 'Phone', sortable: true, cell: (row) => row.phone ?? '—' },
      { key: 'email', header: 'Email', sortable: true, cell: (row) => row.email ?? '—' },
      { key: 'orderCount', header: 'Orders', sortable: true, cell: (row) => row.orderCount },
      { key: 'totalSpentCents', header: 'Total spent', sortable: true, cell: (row) => formatCurrencyFromCents(row.totalSpentCents) },
      { key: 'lastOrderAt', header: 'Last order', sortable: true, cell: (row) => row.lastOrderAt ? new Date(row.lastOrderAt).toLocaleDateString() : 'Never' },
    ]} />}
    {detail.id ? <Drawer open title="Customer details" onClose={detail.close} footer={customer ? <Button onPress={() => { setEditor({ customer }); detail.close(); }}>Edit customer</Button> : undefined}>
      {detail.query.isPending ? <Skeleton variant="block" /> : detail.query.isError ? <ErrorState message={detail.query.error.message ?? 'Unable to load customer.'} onRetry={() => void detail.query.refetch()} /> : customer ? <Stack gap={5}>
        <Text variant="h2">{customer.name}</Text><Text>Phone: {customer.phone ?? 'Not provided'}</Text><Text>Email: {customer.email ?? 'Not provided'}</Text>
        <Row style={{ flexWrap: 'wrap' }}><KpiCard label="Orders" value={String(customer.orderCount)} /><KpiCard label="Total spent" value={formatCurrencyFromCents(customer.totalSpentCents)} /><KpiCard label="Average order value" value={formatCurrencyFromCents(detail.average)} /></Row>
        <Text variant="h3">Recent orders</Text>{customer.recentOrders.length ? <List>{customer.recentOrders.map((order) => <List.Item key={order.id} title={`Order ${order.id.slice(0, 8)}`} description={`${order.status} · ${formatCurrencyFromCents(order.totalCents)} · ${new Date(order.createdAt).toLocaleString()}`} onPress={() => router.push({ pathname: '/orders', params: { orderId: order.id } })} />)}</List> : <EmptyState title="No orders yet" />}
      </Stack> : null}
    </Drawer> : null}
    {editor ? <CustomerFormDrawer key={editor.customer?.id ?? 'new'} customer={editor.customer} onClose={() => setEditor(undefined)} /> : null}
  </>;
}
