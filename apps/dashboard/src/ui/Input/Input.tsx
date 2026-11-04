import { forwardRef, type ComponentRef } from 'react';
import { TextInput } from 'react-native';
import { FieldInput, type FieldInputProps } from '../_internal/FieldInput';

export type InputProps = Omit<FieldInputProps, 'multiline'>;
export const Input = forwardRef<ComponentRef<typeof TextInput>, InputProps>(function Input(props, ref) {
  return <FieldInput {...props} ref={ref} multiline={false} />;
});
