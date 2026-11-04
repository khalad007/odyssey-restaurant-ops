import { useListMenuCategories, useListMenuItems } from '@odyssey/api-client';
import { useState } from 'react';

export function useMenuItems() {
  const [categoryId, setCategoryId] = useState('');
  const categories = useListMenuCategories();
  const items = useListMenuItems();

  return {
    items: (items.data ?? []).filter((item) => !categoryId || item.categoryId === categoryId),
    totalCount: items.data?.length ?? 0,
    categories: categories.data ?? [],
    categoryId,
    setCategoryId,
    categoryOptions: [{ value: '', label: 'All categories' }, ...(categories.data ?? []).map((category) => ({ value: category.id, label: category.name }))],
    categoryNames: new Map(categories.data?.map((category) => [category.id, category.name])),
    isLoading: categories.isPending || items.isPending,
    loadError: categories.isError || items.isError
      ? (categories.error ?? items.error)?.message ?? 'Unable to load the menu.'
      : null,
    isRefreshing: categories.isFetching || items.isFetching,
    retry: () => { void Promise.all([categories.refetch(), items.refetch()]); },
  };
}
