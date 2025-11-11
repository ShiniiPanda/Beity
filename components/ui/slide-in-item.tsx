import { PropsWithChildren, useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface SlideInItemProps {
  startX?: number;
  startOpacity?: number;
  delay?: number;
}

function SlideInItem({
  startX = -200,
  startOpacity = 1,
  delay = 0,
  children,
}: PropsWithChildren<SlideInItemProps>) {
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(startOpacity);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withTiming(0, {
        duration: 1000,
        easing: Easing.out(Easing.exp),
      }),
    );

    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.exp),
      }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export default SlideInItem;
