import type { MenuItem } from '@odyssey/api-client';
import { formatCurrencyFromCents } from '@odyssey/shared';
import { Badge, IconButton, Row, Stack, Switch, Table, Text } from '../../ui';

export function MenuItemsTable({ items, categoryNames, disabled, updatingItemId, onToggle, onEdit, onDelete }: {
  items: MenuItem[];
  categoryNames: Map<string, string>;
  disabled: boolean;
  updatingItemId?: string;
  onToggle: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}) {
  return <Table label="Menu items" rows={items} rowKey={(item) => item.id} columns={[
    { key: 'name', header: 'Name', cell: (item) => <Stack gap={1}><Text variant="label">{item.name}</Text>{item.description ? <Text variant="caption" color="textSecondary">{item.description}</Text> : null}</Stack> },
    { key: 'category', header: 'Category', cell: (item) => categoryNames.get(item.categoryId) ?? 'Uncategorized' },
    { key: 'price', header: 'Price', cell: (item) => formatCurrencyFromCents(item.priceCents) },
    { key: 'availability', header: 'Availability', cell: (item) => <Stack gap={2}><Badge tone={item.isAvailable ? 'success' : 'neutral'} variant="dot">{item.isAvailable ? 'Available' : 'Unavailable'}</Badge><Switch accessibilityLabel={`Availability for ${item.name}`} value={item.isAvailable} disabled={disabled} onValueChange={() => onToggle(item)} />{updatingItemId === item.id ? <Text variant="caption" accessibilityLiveRegion="polite">Updating…</Text> : null}</Stack> },
    { key: 'actions', header: 'Actions', cell: (item) => <Row gap={1}><IconButton icon="create-outline" variant="ghost" accessibilityLabel={`Edit ${item.name}`} disabled={disabled} onPress={() => onEdit(item)} /><IconButton icon="trash-outline" variant="ghost" accessibilityLabel={`Delete ${item.name}`} disabled={disabled} onPress={() => onDelete(item)} /></Row> },
  ]} />;
}
