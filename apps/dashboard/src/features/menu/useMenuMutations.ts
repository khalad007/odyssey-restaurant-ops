import { getListMenuItemsQueryKey, useCreateMenuItem, useDeleteMenuItem, useUpdateMenuItem, type CreateMenuItemBody, type MenuItem } from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useToast } from '../../ui';
import { errorMessage } from './errorMessage';

export function useMenuMutations() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const refresh = () => queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
  const options = { mutation: { onSuccess: refresh } };
  const create = useCreateMenuItem(options);
  const update = useUpdateMenuItem(options);
  const remove = useDeleteMenuItem(options);
  const toggle = useUpdateMenuItem(options);
  const busy = useRef(false);
  const [editor, setEditor] = useState<{ item?: MenuItem }>();
  const [deleteItem, setDeleteItem] = useState<MenuItem>();
  const [saveError, setSaveError] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();
  const isPending = create.isPending || update.isPending || remove.isPending || toggle.isPending;
  const failure = (error: unknown, fallback: string) => {
    const message = errorMessage(error, fallback);
    showToast({ tone: 'error', title: 'Menu update failed', message });
    return message;
  };
  async function save(data: CreateMenuItemBody) {
    if (busy.current) return;
    busy.current = true;
    setSaveError(undefined);
    try {
      if (editor?.item) await update.mutateAsync({ id: editor.item.id, data });
      else await create.mutateAsync({ data });
      showToast({ tone: 'success', message: editor?.item ? 'Menu item updated.' : 'Menu item created.' });
      setEditor(undefined);
    } catch (error) { setSaveError(failure(error, 'Unable to save this menu item.')); }
    finally { busy.current = false; }
  }
  async function confirmDelete() {
    if (!deleteItem || busy.current) return;
    busy.current = true;
    setDeleteError(undefined);
    try {
      await remove.mutateAsync({ id: deleteItem.id });
      showToast({ tone: 'success', message: 'Menu item deleted.' });
      setDeleteItem(undefined);
    } catch (error) { setDeleteError(failure(error, 'Unable to delete this menu item.')); }
    finally { busy.current = false; }
  }
  async function toggleAvailability(item: MenuItem) {
    if (busy.current) return;
    busy.current = true;
    try {
      await toggle.mutateAsync({ id: item.id, data: { isAvailable: !item.isAvailable } });
      showToast({ tone: 'success', message: `${item.name} is now ${item.isAvailable ? 'unavailable' : 'available'}.` });
    } catch (error) { failure(error, 'Unable to update availability.'); }
    finally { busy.current = false; }
  }
  return {
    editor, deleteItem, saveError, deleteError, isPending,
    isSaving: create.isPending || update.isPending,
    isDeleting: remove.isPending,
    updatingItemId: toggle.isPending ? toggle.variables?.id : undefined,
    newItem: () => { if (!busy.current) { setSaveError(undefined); setEditor({}); } },
    editItem: (item: MenuItem) => { if (!busy.current) { setSaveError(undefined); setEditor({ item }); } },
    requestDelete: (item: MenuItem) => { if (!busy.current) { setDeleteError(undefined); setDeleteItem(item); } },
    closeEditor: () => { if (!busy.current) setEditor(undefined); },
    closeDelete: () => { if (!busy.current) setDeleteItem(undefined); },
    save, confirmDelete, toggleAvailability,
  };
}
