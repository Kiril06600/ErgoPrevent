import React, { useEffect, useState } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

type AnimatedScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function AnimatedScreen({ children, style }: AnimatedScreenProps) {
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}