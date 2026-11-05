import { fireEvent, render } from '@testing-library/react-native';
import { ErrorState } from './ErrorState';

test('shows the error and invokes retry', async () => {
  const onRetry = jest.fn();
  const screen = await render(<ErrorState message="Unable to load orders" onRetry={onRetry} />);
  expect(screen.getByText('Unable to load orders')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});
