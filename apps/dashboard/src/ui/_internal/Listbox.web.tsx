import type { ListboxProps } from './Listbox';
export function Listbox({ id, label, children }: ListboxProps) {
  return <div id={id} role="listbox" aria-label={label}>{children}</div>;
}
