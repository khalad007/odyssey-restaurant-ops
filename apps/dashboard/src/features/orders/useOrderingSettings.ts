import { useGetSettings } from '@odyssey/api-client';

export function useOrderingSettings() {
  const settings = useGetSettings();
  return {
    paused: settings.data?.acceptingOrders === false,
    prepTimeMinutes: settings.data?.prepTimeMinutes,
  };
}
