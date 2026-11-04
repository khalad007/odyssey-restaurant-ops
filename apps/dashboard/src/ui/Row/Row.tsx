import { Stack, type StackProps } from '../Stack';

export type RowProps = Omit<StackProps, 'direction'>;
export function Row({ align = 'center', ...props }: RowProps) {
  return <Stack {...props} align={align} direction="row" />;
}
