import type { MenuItem } from '@odyssey/api-client';
import { Alert, Button, Modal, Row, Stack, Text } from '../../ui';

export function DeleteMenuItemModal({ item, error, isDeleting, onConfirm, onClose }: {
  item: MenuItem;
  error?: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return <Modal open title="Delete menu item" onClose={onClose} footer={<Row justify="flex-end"><Button variant="secondary" disabled={isDeleting} onPress={onClose}>Keep item</Button><Button variant="danger" loading={isDeleting} onPress={onConfirm}>Delete item</Button></Row>}>
    <Stack gap={4}><Text>Delete “{item.name}”? This cannot be undone.</Text><Text color="textSecondary">Items used in orders cannot be deleted. Mark the item unavailable to stop new orders instead.</Text>{error ? <Alert tone="danger" title="Could not delete item" message={error} /> : null}</Stack>
  </Modal>;
}
