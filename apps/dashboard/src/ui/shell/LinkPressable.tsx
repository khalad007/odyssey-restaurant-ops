import { forwardRef, type ComponentRef, type MouseEvent, type MouseEventHandler } from 'react';
import { Platform, Pressable, type PressableProps } from 'react-native';

type LinkPressableProps = PressableProps & { onClick?: MouseEventHandler<HTMLElement> };

// Expo Router's web Link supplies onClick, while RN Web's Pressable consumes
// onPress. Relay the composed router handler so clicks do not reload the page.
export const LinkPressable = forwardRef<ComponentRef<typeof Pressable>, LinkPressableProps>(function LinkPressable({ onClick, onPress, ...props }, ref) {
  return <Pressable {...props} ref={ref} onPress={Platform.OS === 'web' && onClick
    ? (event) => onClick(event as unknown as MouseEvent<HTMLElement>)
    : onPress} />;
});
