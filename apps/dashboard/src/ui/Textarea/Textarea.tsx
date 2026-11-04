import { forwardRef, type ComponentRef } from 'react';
import { TextInput } from 'react-native';
import { FieldInput, type FieldInputProps } from '../_internal/FieldInput';

export type TextareaProps = Omit<FieldInputProps, 'multiline'>;
export const Textarea = forwardRef<ComponentRef<typeof TextInput>, TextareaProps>(function Textarea(props, ref) {
  return <FieldInput {...props} ref={ref} multiline />;
});
