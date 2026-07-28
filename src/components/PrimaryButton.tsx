import React from "react";
import { Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import PressableScale from "./PressableScale";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  arrow?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  title,
  onPress,
  arrow = true,
  style,
}: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <PressableScale style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
      {arrow && <Text style={styles.buttonArrow}>→</Text>}
    </PressableScale>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
    },
    buttonText: {
      color: colors.black,
      fontSize: 15,
      fontWeight: "900",
    },
    buttonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
  });
}