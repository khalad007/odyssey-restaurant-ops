import type { ListOrdersParams } from '@odyssey/api-client';
import { useState } from 'react';

export function useOrderFilters() {
  const [filters, setFilters] = useState<ListOrdersParams>({});
  const set = (next: Partial<ListOrdersParams>) => setFilters((current) => ({ ...current, ...next }));
  return { filters, set, clear: () => setFilters({}) };
}
