import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from "react-native";

type PressableScaleProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
};

export default function PressableScale({
  children,
  style,
  pressedStyle,
  ...props
}: PressableScaleProps) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        style,
        pressed ? styles.pressed : null,
        pressed && pressedStyle ? pressedStyle : null,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.94 }],
  },
});