export const lightColors = {
  mode: "light",

  background: "transparent",
  backgroundSoft: "rgba(255, 255, 255, 0.10)",

  card: "rgba(255, 255, 255, 0.16)",
  cardWarm: "rgba(255, 255, 255, 0.11)",

  primary: "#F5EEDF",
  primaryDark: "#E2D8C8",
  primaryLight: "rgba(245, 238, 223, 0.16)",

  secondary: "#163028",
  secondaryLight: "rgba(255, 255, 255, 0.08)",

  accent: "#F5EEDF",
  accentSoft: "rgba(245, 238, 223, 0.12)",

  turquoise: "#5F9F95",
  turquoiseSoft: "rgba(95, 159, 149, 0.12)",
  turquoiseLight: "rgba(95, 159, 149, 0.16)",

  text: "#F6F1E8",
  textSoft: "rgba(246, 241, 232, 0.78)",
  textMuted: "rgba(246, 241, 232, 0.56)",

  border: "rgba(255, 255, 255, 0.18)",

  success: "#5F9F95",
  successSoft: "rgba(95, 159, 149, 0.13)",

  warning: "rgba(245, 238, 223, 0.08)",
  warningText: "#F5EEDF",
  warningBorder: "rgba(245, 238, 223, 0.16)",

  danger: "#B98272",
  dangerSoft: "rgba(185, 130, 114, 0.14)",
  dangerBorder: "rgba(185, 130, 114, 0.28)",

  white: "#F6F1E8",
  black: "#03110D",
};

export const darkColors = {
  mode: "dark",

  background: "transparent",
  backgroundSoft: "rgba(255, 255, 255, 0.06)",

  card: "rgba(255, 255, 255, 0.10)",
  cardWarm: "rgba(255, 255, 255, 0.065)",

  primary: "#F5EEDF",
  primaryDark: "#E2D8C8",
  primaryLight: "rgba(245, 238, 223, 0.15)",

  secondary: "#163028",
  secondaryLight: "rgba(255, 255, 255, 0.08)",

  accent: "#F5EEDF",
  accentSoft: "rgba(245, 238, 223, 0.11)",

  turquoise: "#5F9F95",
  turquoiseSoft: "rgba(95, 159, 149, 0.14)",
  turquoiseLight: "rgba(95, 159, 149, 0.18)",

  text: "#F6F1E8",
  textSoft: "rgba(246, 241, 232, 0.78)",
  textMuted: "rgba(246, 241, 232, 0.54)",

  border: "rgba(255, 255, 255, 0.18)",

  success: "#5F9F95",
  successSoft: "rgba(95, 159, 149, 0.14)",

  warning: "rgba(245, 238, 223, 0.08)",
  warningText: "#F5EEDF",
  warningBorder: "rgba(245, 238, 223, 0.16)",

  danger: "#B98272",
  dangerSoft: "rgba(185, 130, 114, 0.14)",
  dangerBorder: "rgba(185, 130, 114, 0.28)",

  white: "#F6F1E8",
  black: "#03110D",
};

export type ThemeColors = typeof lightColors;

export const colors = lightColors;