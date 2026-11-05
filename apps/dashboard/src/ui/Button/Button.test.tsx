import { fireEvent, render } from '@testing-library/react-native';
import { Button } from './Button';

test.each([{ disabled: true }, { loading: true }])('blocked button does not invoke onPress: %p', async (props) => {
  const onPress = jest.fn();
  const screen = await render(<Button {...props} onPress={onPress}>Save</Button>);
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  expect(onPress).not.toHaveBeenCalled();
});

test('loading renders a spinner; enabled button fires', async () => {
  const onPress = jest.fn();
  const screen = await render(<Button loading onPress={onPress}>Save</Button>);
  expect(screen.getByLabelText('Loading')).toBeOnTheScreen();
  await screen.rerender(<Button onPress={onPress}>Save</Button>);
  expect(screen.queryByLabelText('Loading')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
