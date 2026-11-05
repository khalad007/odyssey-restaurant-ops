import { getListOrdersQueryKey, useListOrders, useListCustomers, useTransitionOrder } from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { motion } from '@odyssey/shared';
import { useToast } from '../../ui';
import { useOrderFilters } from './useOrderFilters';

export function useOrders() {
  const filters = useOrderFilters();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { const timer = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, motion.durations.slow); return () => clearTimeout(timer); }, [search]);
  const dateValue = (value: string | undefined, end: boolean) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? `${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z` : undefined;
  const dateFrom = dateValue(filters.filters.dateFrom, false);
  const dateTo = dateValue(filters.filters.dateTo, true);
  const dateError = (filters.filters.dateFrom && !dateFrom) || (filters.filters.dateTo && !dateTo) ? 'Use YYYY-MM-DD for dates.' : dateFrom && dateTo && dateFrom > dateTo ? 'From date must precede to date.' : undefined;
  const query = useListOrders({ ...filters.filters, dateFrom, dateTo, search: debounced || undefined, page, pageSize: 20 }, { query: { enabled: !dateError } });
  const customers = useListCustomers();
  const client = useQueryClient();
  const { showToast } = useToast();
  const transition = useTransitionOrder({ mutation: {
    onSuccess: async () => { await client.invalidateQueries({ queryKey: getListOrdersQueryKey() }); showToast({ tone: 'success', message: 'Order updated.' }); },
    onError: (error) => showToast({ tone: 'error', message: error.message ?? 'Unable to update order.' }),
  } });
  return { query, customers, dateError, filters: filters.filters, search, setSearch, page, setPage,
    setFilters: (next: Parameters<typeof filters.set>[0]) => { filters.set(next); setPage(1); },
    clear: () => { filters.clear(); setSearch(''); setDebounced(''); setPage(1); },
    transition,
  };
}
