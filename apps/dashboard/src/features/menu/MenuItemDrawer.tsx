import type { MenuCategory, MenuItem } from '@odyssey/api-client';
import { Alert, Button, Drawer, Input, Row, Select, Stack, Switch, Textarea } from '../../ui';
import { useMenuItemForm } from './useMenuItemForm';

export function MenuItemDrawer({ item, categories, isSaving, error, onSave, onClose }: {
  item?: MenuItem;
  categories: MenuCategory[];
  isSaving: boolean;
  error?: string;
  onSave: Parameters<typeof useMenuItemForm>[1];
  onClose: () => void;
}) {
  const form = useMenuItemForm(item, onSave);
  return <Drawer open title={item ? 'Edit menu item' : 'New menu item'} onClose={onClose} footer={
    <Row justify="flex-end"><Button variant="secondary" disabled={isSaving} onPress={onClose}>Cancel</Button><Button loading={isSaving} disabled={!categories.length} onPress={() => void form.submit()}>{item ? 'Save changes' : 'Create item'}</Button></Row>
  }><Stack gap={5}>
    {error ? <Alert tone="danger" title="Could not save item" message={error} /> : null}
    {!categories.length ? <Alert tone="warning" title="A category is required" message="Create a menu category before adding an item." /> : null}
    <Input label="Name" value={form.name} onChangeText={form.setName} error={form.errors.name} disabled={isSaving} autoFocus placeholder="For example, garden pasta" />
    <Select label="Category" value={form.categoryId} onValueChange={form.setCategoryId} options={categories.map((category) => ({ value: category.id, label: category.name }))} error={form.errors.categoryId} disabled={isSaving} placeholder="Choose a category" />
    <Input label="Price (USD)" value={form.price} onChangeText={form.setPrice} error={form.errors.priceCents} disabled={isSaving} inputMode="decimal" placeholder="0.00" helperText="Enter a dollar amount with up to two decimal places." />
    <Textarea label="Description" value={form.description} onChangeText={form.setDescription} error={form.errors.description} disabled={isSaving} placeholder="Optional description" />
    <Switch label="Available for orders" value={form.isAvailable} onValueChange={form.setIsAvailable} disabled={isSaving} />
  </Stack></Drawer>;
}
