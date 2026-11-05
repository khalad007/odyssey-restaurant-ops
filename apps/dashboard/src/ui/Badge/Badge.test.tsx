import { render } from '@testing-library/react-native';
import { orderStatusColors, semanticColorVariants } from '@odyssey/shared';
import { Badge } from './Badge';

const expected = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', completed: 'success', cancelled: 'danger' } as const satisfies Record<keyof typeof orderStatusColors, keyof typeof semanticColorVariants>;

test.each(Object.keys(orderStatusColors) as (keyof typeof orderStatusColors)[])('%s badge uses its semantic background and text', async (status) => {
  const palette = orderStatusColors[status];
  expect(palette).toEqual(semanticColorVariants[expected[status]]);
  const screen = await render(<Badge testID="status" palette={palette}>{status}</Badge>);
  expect(screen.getByTestId('status')).toHaveStyle({ backgroundColor: palette.subtle });
  expect(screen.getByText(status)).toHaveStyle({ color: palette.text });
});
