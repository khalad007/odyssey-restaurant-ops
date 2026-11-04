import {
  getListMenuItemsQueryKey,
  useListMenuCategories,
  useListMenuItems,
  useUpdateMenuItem,
} from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';

export function useMenuItems() {
  const queryClient = useQueryClient();
  const categories = useListMenuCategories();
  const items = useListMenuItems();
  const update = useUpdateMenuItem({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }),
    },
  });

  function toggleAvailability(item: NonNullable<typeof items.data>[number]) {
    update.mutate({ id: item.id, data: { isAvailable: !item.isAvailable } });
  }

  return {
    items: items.data ?? [],
    categoryNames: new Map(categories.data?.map((category) => [category.id, category.name])),
    isLoading: categories.isPending || items.isPending,
    loadError: categories.isError || items.isError
      ? (categories.error ?? items.error)?.message ?? 'Unable to load the menu.'
      : null,
    updateError: update.isError ? update.error?.message ?? 'Unable to update availability.' : null,
    isUpdating: update.isPending,
    toggleAvailability,
    retry: () => { void Promise.all([categories.refetch(), items.refetch()]); },
  };
}
