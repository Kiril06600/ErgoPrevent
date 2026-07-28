import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#082D24",
    background: "#F4EDE1",
    backgroundElement: "#E9E1D4",
    backgroundSelected: "#D8CEC0",
    textSecondary: "rgba(8, 45, 36, 0.72)",
  },
  dark: {
    text: "#F6F1E8",
    background: "#082D24",
    backgroundElement: "#163028",
    backgroundSelected: "#0A3027",
    textSecondary: "rgba(246, 241, 232, 0.78)",
  },
} as const;

export type ThemeColor = Extract<
  keyof typeof Colors.light,
  keyof typeof Colors.dark
>;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "Georgia",
    rounded: "system-ui",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "Georgia",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui",
    serif: "Georgia",
    rounded: "system-ui",
    mono: "monospace",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({
  ios: 50,
  android: 80,
}) ?? 0;

export const MaxContentWidth = 800;