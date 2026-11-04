import { Overlay, type OverlayProps } from '../_internal/Overlay';
export type DrawerProps = OverlayProps;
export function Drawer(props: DrawerProps) { return <Overlay {...props} drawer />; }
