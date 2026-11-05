import { getGetDashboardSummaryQueryKey, getGetOrderQueryKey, getListOrdersQueryKey, useTransitionOrder } from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '../../ui';

export function useOrderTransition() {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [cancelId, setCancelId] = useState<string>();
  const mutation = useTransitionOrder({ mutation: {
    onSuccess: async (_, variables) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: getListOrdersQueryKey() }),
        client.invalidateQueries({ queryKey: getGetOrderQueryKey(variables.id) }),
        client.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }),
      ]);
      setCancelId(undefined);
      showToast({ tone: 'success', message: 'Order updated.' });
    },
    onError: async (error, variables) => {
      showToast({ tone: 'error', message: error?.message ?? 'Unable to update order.' });
      // The transport throws the parsed error body without HTTP status metadata.
      // Refresh on every rejected transition, including all 409 conflicts.
      await client.invalidateQueries({ queryKey: getGetOrderQueryKey(variables.id) });
      await client.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    },
  } });
  const run = (id: string, action: Parameters<typeof mutation.mutate>[0]['data']['action']) => {
    if (mutation.isPending) return;
    if (action === 'cancel') setCancelId(id);
    else mutation.mutate({ id, data: { action } });
  };
  return { mutation, run, cancelId, closeCancel: () => { if (!mutation.isPending) setCancelId(undefined); }, confirmCancel: () => { if (cancelId && !mutation.isPending) mutation.mutate({ id: cancelId, data: { action: 'cancel' } }); } };
}
