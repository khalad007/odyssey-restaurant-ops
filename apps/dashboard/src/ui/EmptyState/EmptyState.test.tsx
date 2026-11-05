import { fireEvent, render } from '@testing-library/react-native';
import { EmptyState } from './EmptyState';

test('renders and invokes its action', async () => {
  const onPress = jest.fn();
  const screen = await render(<EmptyState title="No orders" action={{ label: 'Clear filters', onPress }} />);
  expect(screen.getByText('No orders')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Clear filters' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
