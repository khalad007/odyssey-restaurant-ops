import { createCustomerBodySchema, getGetCustomerQueryKey, getListCustomersQueryKey, useCreateCustomer, useUpdateCustomer, type Customer } from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useToast } from '../../ui';

export function useCustomerForm(customer: Customer | undefined, onClose: () => void) {
  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [email, setEmail] = useState(customer?.email ?? '');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const client = useQueryClient();
  const { showToast } = useToast();
  async function submit() {
    if (lock.current) return;
    const parsed = createCustomerBodySchema.safeParse({ name: name.trim(), phone: phone.trim() || null, email: email.trim() || null });
    if (!parsed.success) { setError(parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')); return; }
    lock.current = true; setPending(true); setError(undefined);
    try {
      if (customer) await update.mutateAsync({ id: customer.id, data: parsed.data });
      else await create.mutateAsync({ data: parsed.data });
      await Promise.all([client.invalidateQueries({ queryKey: getListCustomersQueryKey() }), ...(customer ? [client.invalidateQueries({ queryKey: getGetCustomerQueryKey(customer.id) })] : [])]);
      showToast({ tone: 'success', message: customer ? 'Customer updated.' : 'Customer created.' }); onClose();
    } catch (failure) {
      const message = failure && typeof failure === 'object' && 'message' in failure ? String(failure.message) : 'Unable to save customer.';
      setError(message); showToast({ tone: 'error', message });
    } finally { lock.current = false; setPending(false); }
  }
  return { name, setName, phone, setPhone, email, setEmail, error, pending, submit };
}
