import { Button } from '../Button';
export type UIAction = { label: string; onPress: () => void; disabled?: boolean };
export function Action({ label, onPress, disabled }: UIAction) {
  return <Button onPress={onPress} disabled={disabled}>{label}</Button>;
}
