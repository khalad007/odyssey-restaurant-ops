import { borderWidths, colors, feedback, layout, radii, spacing } from '@odyssey/shared';
import { useState, type ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Button } from '../Button';
import { Row } from '../Row';
import { Stack } from '../Stack';
import { Text } from '../Text';

export type TableColumn<Data> = { key: string; header: string; cell: (row: Data) => ReactNode; sortable?: boolean; flex?: number };
export type TableSort = { key: string; direction: 'asc' | 'desc' };
export type TableProps<Data> = {
  label: string; columns: readonly TableColumn<Data>[]; rows: readonly Data[]; rowKey: (row: Data) => string;
  sort?: TableSort; onSort?: (sort: TableSort) => void; emptyMessage?: string;
};
function Content({ children }: { children: ReactNode }) {
  return typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
}
function Header<Data>({ column, sort, onSort }: { column: TableColumn<Data>; sort?: TableSort; onSort?: TableProps<Data>['onSort'] }) {
  const active = sort?.key === column.key;
  return column.sortable && onSort ? <Button variant="ghost" size="sm" accessibilityLabel={`Sort by ${column.header}`}
    leftIcon={active ? sort.direction === 'asc' ? 'arrow-up' : 'arrow-down' : 'swap-vertical-outline'}
    onPress={() => onSort({ key: column.key, direction: active && sort.direction === 'asc' ? 'desc' : 'asc' })}>{column.header}</Button> :
    <Text variant="label">{column.header}</Text>;
}
function DataRow<Data>({ row, columns }: { row: Data; columns: readonly TableColumn<Data>[] }) {
  const [hovered, setHovered] = useState(false);
  return <View role="row" onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} style={{
    flexDirection: 'row', backgroundColor: hovered ? feedback.hover : colors.surface,
    borderTopWidth: borderWidths.thin, borderTopColor: colors.border,
  }}>{columns.map((column) => <View key={column.key} role="cell" style={{ flex: column.flex ?? feedback.table.columnFlex, padding: spacing[3], justifyContent: 'center' }}>
    <Content>{column.cell(row)}</Content>
  </View>)}</View>;
}
/** Sorting is controlled: headers emit changes; callers provide ordered rows. */
export function Table<Data>({ label, columns, rows, rowKey, sort, onSort, emptyMessage = 'No rows to show.' }: TableProps<Data>) {
  const { width } = useWindowDimensions();
  if (width < layout.breakpoints.md) return <Stack>
    {onSort ? <Row style={{ flexWrap: 'wrap' }}>{columns.filter((column) => column.sortable).map((column) => <Header key={column.key} column={column} sort={sort} onSort={onSort} />)}</Row> : null}
    <View role="list" accessibilityLabel={label} style={{ gap: spacing[3] }}>
      {rows.map((row) => <View key={rowKey(row)} role="listitem" style={{ backgroundColor: colors.surface, borderWidth: borderWidths.thin, borderColor: colors.border, borderRadius: radii.md, padding: spacing[4], gap: spacing[3] }}>
        {columns.map((column) => <Stack key={column.key} gap={1}><Text variant="label" color="textSecondary">{column.header}</Text><Content>{column.cell(row)}</Content></Stack>)}
      </View>)}
      {!rows.length ? <Text color="textMuted">{emptyMessage}</Text> : null}
    </View>
  </Stack>;
  return <View role="table" accessibilityLabel={label} style={{ borderWidth: borderWidths.thin, borderColor: colors.border, borderRadius: radii.md, overflow: 'hidden' }}>
    <View role="rowgroup"><View role="row" style={{ flexDirection: 'row', backgroundColor: colors.background }}>
      {columns.map((column) => <View key={column.key} role="columnheader" aria-sort={sort?.key === column.key ? sort.direction === 'asc' ? 'ascending' : 'descending' : undefined}
        style={{ flex: column.flex ?? feedback.table.columnFlex, padding: spacing[2], justifyContent: 'center' }}>
        <Header column={column} sort={sort} onSort={onSort} />
      </View>)}
    </View></View>
    <View role="rowgroup">{rows.map((row) => <DataRow key={rowKey(row)} row={row} columns={columns} />)}</View>
    {!rows.length ? <View role="row"><View role="cell" style={{ padding: spacing[4] }}><Text color="textMuted">{emptyMessage}</Text></View></View> : null}
  </View>;
}
