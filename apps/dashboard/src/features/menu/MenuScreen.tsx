import { Button, EmptyState, ErrorState, PageHeader, Select, Skeleton, Stack, Text } from '../../ui';
import { DeleteMenuItemModal } from './DeleteMenuItemModal';
import { MenuItemDrawer } from './MenuItemDrawer';
import { MenuItemsTable } from './MenuItemsTable';
import { useMenuItems } from './useMenuItems';
import { useMenuMutations } from './useMenuMutations';

export function MenuScreen() {
  const menu = useMenuItems();
  const mutations = useMenuMutations();
  return <>
    <PageHeader title="Menu" subtitle="Manage your dishes, prices, and availability." actions={<Button leftIcon="add" onPress={mutations.newItem} disabled={menu.isLoading || Boolean(menu.loadError) || mutations.isPending}>New item</Button>} />
    {menu.isLoading ? <Stack accessibilityLabel="Loading menu" role="status"><Text color="textSecondary">Loading menu…</Text><Skeleton variant="text" />{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} variant="block" />)}</Stack> : menu.loadError ?
      <ErrorState message={menu.loadError} onRetry={menu.retry} retrying={menu.isRefreshing} /> : <Stack gap={6}>
        <Select label="Filter by category" options={menu.categoryOptions} value={menu.categoryId} onValueChange={menu.setCategoryId} />
        {!menu.items.length ? <EmptyState icon="restaurant-outline" title={menu.totalCount ? 'No items in this category' : 'No menu items yet'} description={menu.totalCount ? 'Choose another category or create an item.' : 'Add your first dish to start building the menu.'} action={menu.categoryId ? { label: 'Show all categories', onPress: () => menu.setCategoryId('') } : { label: 'New item', onPress: mutations.newItem }} /> :
          <MenuItemsTable items={menu.items} categoryNames={menu.categoryNames} disabled={mutations.isPending} updatingItemId={mutations.updatingItemId} onToggle={mutations.toggleAvailability} onEdit={mutations.editItem} onDelete={mutations.requestDelete} />}
      </Stack>}
    {mutations.editor ? <MenuItemDrawer key={mutations.editor.item?.id ?? 'new'} item={mutations.editor.item} categories={menu.categories} isSaving={mutations.isSaving} error={mutations.saveError} onSave={mutations.save} onClose={mutations.closeEditor} /> : null}
    {mutations.deleteItem ? <DeleteMenuItemModal item={mutations.deleteItem} error={mutations.deleteError} isDeleting={mutations.isDeleting} onConfirm={() => void mutations.confirmDelete()} onClose={mutations.closeDelete} /> : null}
  </>;
}
