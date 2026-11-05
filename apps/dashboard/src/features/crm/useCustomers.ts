import { useListCustomers } from '@odyssey/api-client';
import { useState } from 'react';
import type { TableSort } from '../../ui';

export function useCustomers() {
  const query = useListCustomers();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<TableSort>({ key: 'name', direction: 'asc' });
  const rows = (query.data ?? []).filter((customer) => [customer.name, customer.phone, customer.email].some((value) => value?.toLowerCase().includes(search.trim().toLowerCase()))).sort((a, b) => {
    const key = sort.key as keyof typeof a;
    const left = a[key], right = b[key];
    const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left ?? '').localeCompare(String(right ?? ''));
    return result * (sort.direction === 'asc' ? 1 : -1);
  });
  return { query, rows, search, setSearch, sort, setSort };
}
