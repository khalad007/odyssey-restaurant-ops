import { useGetCustomer } from '@odyssey/api-client';
import { useState } from 'react';

export function useCustomerDetail() {
  const [id, setId] = useState('');
  const query = useGetCustomer(id, { query: { enabled: Boolean(id) } });
  const data = query.data;
  return { id, open: setId, close: () => setId(''), query, average: data?.orderCount ? Math.round(data.totalSpentCents / data.orderCount) : 0 };
}
