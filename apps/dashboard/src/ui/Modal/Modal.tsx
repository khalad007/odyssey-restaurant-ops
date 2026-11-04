import { Overlay, type OverlayProps } from '../_internal/Overlay';
export type ModalProps = OverlayProps;
export function Modal(props: ModalProps) { return <Overlay {...props} />; }
