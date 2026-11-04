import { forwardRef, type ComponentRef } from 'react';
import { View } from 'react-native';
import { Button, type ButtonProps } from '../Button';

export type IconButtonProps = Omit<ButtonProps, 'children' | 'leftIcon' | 'iconOnly' | 'accessibilityLabel'> & {
  icon: NonNullable<ButtonProps['leftIcon']>;
  accessibilityLabel: string;
};
export const IconButton = forwardRef<ComponentRef<typeof View>, IconButtonProps>(function IconButton({ icon, accessibilityLabel, ...props }, ref) {
  return <Button {...props} ref={ref} iconOnly leftIcon={icon} accessibilityLabel={accessibilityLabel}>{accessibilityLabel}</Button>;
});
