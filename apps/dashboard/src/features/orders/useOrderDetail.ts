import { useGetOrder } from '@odyssey/api-client';
import { useLocalSearchParams, useRouter } from 'expo-router';

export function useOrderDetail() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const router = useRouter();
  const id = typeof params.orderId === 'string' ? params.orderId : '';
  const query = useGetOrder(id, { query: { enabled: Boolean(id) } });
  return { id, query, open: (orderId: string) => router.setParams({ orderId }), close: () => router.setParams({ orderId: undefined }) };
}
