import { render } from '@testing-library/react-native';
import * as Native from 'react-native';
import { layout } from '@odyssey/shared';
import { Table } from './Table';

afterEach(() => jest.restoreAllMocks());

test('below tablet width renders labeled stacked rows instead of a table', async () => {
  jest.spyOn(Native, 'useWindowDimensions').mockReturnValue({ width: layout.breakpoints.md - 1, height: layout.breakpoints.lg, scale: 1, fontScale: 1 });
  const screen = await render(<Table label="Menu" rows={[{ id: 'soup', name: 'Soup' }]} rowKey={(row) => row.id} columns={[{ key: 'name', header: 'Name', cell: (row) => row.name }]} />);
  expect(screen.getByLabelText('Menu')).toHaveProp('role', 'list');
  expect(screen.getByText('Name')).toBeOnTheScreen();
  expect(screen.getByText('Soup')).toBeOnTheScreen();
  expect(screen.queryByRole('table')).toBeNull();
});
