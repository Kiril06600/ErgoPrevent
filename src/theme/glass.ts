import { ViewStyle } from "react-native";
import { ThemeColors } from "./colors";

export type GlassTheme = {
  isDark: boolean;
  card: ViewStyle;
  softCard: ViewStyle;
  strongCard: ViewStyle;
  statCard: ViewStyle;
  inputCard: ViewStyle;
  navCard: ViewStyle;
  activePill: ViewStyle;
};

export function getGlassTheme(colors: ThemeColors): GlassTheme {
  const isDark = colors.background.toLowerCase() === "#03110d";

  const border = isDark
    ? "rgba(224, 224, 224, 0.10)"
    : "rgba(163, 133, 96, 0.16)";

  const cardBackground = isDark
    ? "rgba(224, 224, 224, 0.05)"
    : "rgba(255, 255, 255, 0.62)";

  const softBackground = isDark
    ? "rgba(224, 224, 224, 0.035)"
    : "rgba(255, 255, 255, 0.50)";

  const strongBackground = isDark
    ? "rgba(224, 224, 224, 0.07)"
    : "rgba(255, 255, 255, 0.72)";

  const activeBackground = isDark
    ? "rgba(245, 238, 223, 0.10)"
    : "rgba(216, 196, 182, 0.34)";

  const shadow = isDark
    ? "0px 14px 34px rgba(0, 0, 0, 0.22)"
    : "0px 12px 30px rgba(83, 64, 37, 0.10)";

  const softShadow = isDark
    ? "0px 10px 24px rgba(0, 0, 0, 0.16)"
    : "0px 8px 22px rgba(83, 64, 37, 0.08)";

  return {
    isDark,

    card: {
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
      boxShadow: shadow,
      overflow: "hidden",
    },

    softCard: {
      backgroundColor: softBackground,
      borderWidth: 1,
      borderColor: border,
      boxShadow: softShadow,
      overflow: "hidden",
    },

    strongCard: {
      backgroundColor: strongBackground,
      borderWidth: 1,
      borderColor: border,
      boxShadow: shadow,
      overflow: "hidden",
    },

    statCard: {
      backgroundColor: softBackground,
      borderWidth: 1,
      borderColor: border,
      boxShadow: softShadow,
      overflow: "hidden",
    },

    inputCard: {
      backgroundColor: isDark
        ? "rgba(224, 224, 224, 0.04)"
        : "rgba(255, 255, 255, 0.44)",
      borderWidth: 1,
      borderColor: border,
      boxShadow: softShadow,
    },

    navCard: {
      backgroundColor: isDark
        ? "rgba(224, 224, 224, 0.04)"
        : "rgba(255, 255, 255, 0.70)",
      borderWidth: 1,
      borderColor: border,
      boxShadow: shadow,
      overflow: "hidden",
    },

    activePill: {
      backgroundColor: activeBackground,
      borderWidth: 1,
      borderColor: border,
    },
  };
}