import React from "react";
import { Text, View, StyleSheet } from "react-native";

type AnimatedIconProps = {
  icon?: string;
  label?: string;
  active?: boolean;
  size?: number;
};

export default function AnimatedIcon({
  icon = "●",
  label,
  active = false,
  size = 22,
}: AnimatedIconProps) {
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.icon,
          {
            fontSize: size,
            opacity: active ? 1 : 0.7,
          },
        ]}
      >
        {icon}
      </Text>

      {label ? (
        <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    textAlign: "center",
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#9E968A",
  },
  labelActive: {
    color: "#A38560",
  },
});