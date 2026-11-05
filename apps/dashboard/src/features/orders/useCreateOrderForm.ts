import { createOrderBodySchema, getListOrdersQueryKey, getGetDashboardSummaryQueryKey, useCreateOrder, useListCustomers, useListMenuItems } from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useToast } from '../../ui';

export function useCreateOrderForm(onClose: () => void) {
  const customers = useListCustomers();
  const menu = useListMenuItems({ isAvailable: 'true' });
  const available = (menu.data ?? []).filter((item) => item.isAvailable);
  const [customerId, setCustomerId] = useState('');
  const [orderType, setOrderType] = useState<Parameters<ReturnType<typeof useCreateOrder>['mutate']>[0]['data']['orderType']>('pickup');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Parameters<ReturnType<typeof useCreateOrder>['mutate']>[0]['data']['items']>([]);
  const [error, setError] = useState<string>();
  const locked = useRef(false);
  const client = useQueryClient();
  const { showToast } = useToast();
  const create = useCreateOrder();
  const add = (id: string) => {
    if (!available.some((item) => item.id === id)) return;
    setItems((current) => current.some((line) => line.menuItemId === id) ? current.map((line) => line.menuItemId === id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { menuItemId: id, quantity: 1 }]);
  };
  async function submit() {
    if (locked.current) return;
    const parsed = createOrderBodySchema.safeParse({ customerId, orderType, notes: notes.trim() || null, items });
    if (!parsed.success) { setError(parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')); return; }
    if (items.some((line) => !available.some((item) => item.id === line.menuItemId))) { setError('One or more items are no longer available. Remove them before submitting.'); return; }
    locked.current = true;
    setError(undefined);
    try {
      await create.mutateAsync({ data: parsed.data });
      await Promise.all([client.invalidateQueries({ queryKey: getListOrdersQueryKey() }), client.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() })]);
      showToast({ tone: 'success', message: 'Order created.' });
      onClose();
    } catch (failure) { setError(failure && typeof failure === 'object' && 'message' in failure ? String(failure.message) : 'Unable to create order.'); }
    finally { locked.current = false; }
  }
  return { customers, menu, available, customerId, setCustomerId, orderType, setOrderType, notes, setNotes, items, add,
    remove: (id: string) => setItems((current) => current.filter((line) => line.menuItemId !== id)),
    quantity: (id: string, delta: number) => setItems((current) => current.map((line) => line.menuItemId === id ? { ...line, quantity: Math.max(1, line.quantity + delta) } : line)),
    estimated: items.reduce((sum, line) => sum + (available.find((item) => item.id === line.menuItemId)?.priceCents ?? 0) * line.quantity, 0),
    error, pending: create.isPending, submit,
  };
}
