import { feedback } from '@odyssey/shared';
import { View } from 'react-native';
import { Button } from '../Button';
import { Row } from '../Row';
import { Text } from '../Text';

export type PaginationProps = { page: number; totalPages: number; onPageChange: (page: number) => void; disabled?: boolean };
export function Pagination({ page, totalPages, onPageChange, disabled = false }: PaginationProps) {
  const count = Number.isFinite(totalPages) ? Math.max(0, Math.floor(totalPages)) : 0;
  const current = Number.isFinite(page) ? Math.min(Math.max(1, Math.floor(page)), Math.max(count, 1)) : 1;
  const pages = [...new Set([1, count, ...Array.from({ length: feedback.pagination.siblings * 2 + 1 }, (_, index) => current - feedback.pagination.siblings + index)])]
    .filter((number) => number >= 1 && number <= count).sort((a, b) => a - b);
  return <View role="navigation" accessibilityLabel="Pagination"><Row gap={1} style={{ flexWrap: 'wrap' }}>
    <Button variant="ghost" size="sm" leftIcon="chevron-back" accessibilityLabel="Previous page" disabled={disabled || current <= 1 || !count} onPress={() => onPageChange(current - 1)}>Previous</Button>
    {pages.map((number, index) => <Row key={number} gap={1}>
      {index > 0 && number > pages[index - 1] + 1 ? <Text accessibilityLabel="More pages">…</Text> : null}
      <Button variant={number === current ? 'primary' : 'ghost'} size="sm" accessibilityLabel={`Page ${number}`} aria-current={number === current ? 'page' : undefined}
        disabled={disabled} onPress={() => { if (number !== current) onPageChange(number); }}>{String(number)}</Button>
    </Row>)}
    {!count ? <Text color="textMuted">No pages</Text> : null}
    <Button variant="ghost" size="sm" leftIcon="chevron-forward" accessibilityLabel="Next page" disabled={disabled || current >= count || !count} onPress={() => onPageChange(current + 1)}>Next</Button>
  </Row></View>;
}
