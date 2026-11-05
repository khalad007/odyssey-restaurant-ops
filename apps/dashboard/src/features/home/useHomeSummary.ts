import { useGetDashboardSummary, useListOrders, useListCustomers } from '@odyssey/api-client';

export function useHomeSummary() {
  const summary = useGetDashboardSummary();
  const pending = useListOrders({ status: 'pending', page: 1, pageSize: 5 });
  const customers = useListCustomers();
  return { summary, pending, customers };
}
