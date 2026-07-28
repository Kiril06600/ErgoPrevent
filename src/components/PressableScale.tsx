import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

type PressableScaleProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PressableScale({
  children,
  style,
  pressedStyle,
  scaleTo = 0.96,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  function animateTo(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 28,
      bounciness: 4,
    }).start();
  }

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          setIsPressed(true);
          animateTo(scaleTo);
        }

        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!disabled) {
          setIsPressed(false);
          animateTo(1);
        }

        onPressOut?.(event);
      }}
      style={[
        style,
        isPressed ? styles.pressed : null,
        isPressed && pressedStyle ? pressedStyle : null,
        disabled ? styles.disabled : null,
        {
          transform: [{ scale }],
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.45,
  },
});