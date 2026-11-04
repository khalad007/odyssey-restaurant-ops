import { colors, feedback, layout, radii } from '@odyssey/shared';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, type DimensionValue } from 'react-native';
import { useReducedMotion } from '../_internal/useReducedMotion';

export type SkeletonProps = { variant?: 'text' | 'block' | 'circle'; width?: DimensionValue; height?: DimensionValue; animate?: boolean };
export function Skeleton({ variant = 'block', width, height, animate = true }: SkeletonProps) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(feedback.skeleton.maxOpacity)).current;
  useEffect(() => {
    if (!animate || reduced) { opacity.setValue(feedback.skeleton.maxOpacity); return; }
    const timing = (toValue: number) => Animated.timing(opacity, { toValue, duration: feedback.skeleton.pulseDuration, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' });
    const animation = Animated.loop(Animated.sequence([timing(feedback.skeleton.minOpacity), timing(feedback.skeleton.maxOpacity)]));
    animation.start();
    return () => animation.stop();
  }, [animate, reduced, opacity]);
  const defaultHeight = variant === 'text' ? feedback.skeleton.textHeight : variant === 'circle' ? feedback.skeleton.circleSize : feedback.skeleton.blockHeight;
  return <Animated.View testID="skeleton" accessible={false} aria-hidden style={{
    width: width ?? (variant === 'circle' ? feedback.skeleton.circleSize : layout.sizes.full), height: height ?? defaultHeight,
    backgroundColor: colors.neutral[200], borderRadius: variant === 'circle' ? radii.full : radii.sm, opacity,
  }} />;
}
