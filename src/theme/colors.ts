export const lightColors = {
  mode: "light",

  background: "transparent",
  backgroundSoft: "rgba(255, 255, 255, 0.18)",

  card: "rgba(255, 255, 255, 0.26)",
  cardWarm: "rgba(255, 255, 255, 0.17)",

  primary: "#D8C4B6",
  primaryDark: "#C8AA98",
  primaryLight: "rgba(255, 255, 255, 0.26)",

  secondary: "#163028",
  secondaryLight: "rgba(255, 255, 255, 0.14)",

  accent: "#D8C4B6",
  accentSoft: "rgba(216, 196, 182, 0.20)",

  turquoise: "#5F9F95",
  turquoiseSoft: "rgba(95, 159, 149, 0.12)",
  turquoiseLight: "rgba(95, 159, 149, 0.18)",

  text: "#03110D",
  textSoft: "rgba(3, 17, 13, 0.74)",
  textMuted: "rgba(3, 17, 13, 0.54)",

  border: "rgba(255, 255, 255, 0.42)",

  success: "#5F9F95",
  successSoft: "rgba(95, 159, 149, 0.14)",

  warning: "rgba(255, 246, 232, 0.34)",
  warningText: "#5F4E3A",
  warningBorder: "rgba(255, 255, 255, 0.32)",

  danger: "#B98272",
  dangerSoft: "rgba(185, 130, 114, 0.14)",
  dangerBorder: "rgba(185, 130, 114, 0.28)",

  white: "#FFFFFF",
  black: "#03110D",
};

export const darkColors = {
  mode: "dark",

  background: "transparent",
  backgroundSoft: "rgba(255, 255, 255, 0.03)",

  card: "rgba(255, 255, 255, 0.07)",
  cardWarm: "rgba(255, 255, 255, 0.045)",

  primary: "#F5EEDF",
  primaryDark: "#E2D8C8",
  primaryLight: "rgba(245, 238, 223, 0.13)",

  secondary: "#163028",
  secondaryLight: "rgba(255, 255, 255, 0.07)",

  accent: "#F5EEDF",
  accentSoft: "rgba(245, 238, 223, 0.10)",

  turquoise: "#5F9F95",
  turquoiseSoft: "rgba(95, 159, 149, 0.14)",
  turquoiseLight: "rgba(95, 159, 149, 0.18)",

  text: "#F6F4EE",
  textSoft: "rgba(246, 244, 238, 0.76)",
  textMuted: "rgba(246, 244, 238, 0.52)",

  border: "rgba(255, 255, 255, 0.17)",

  success: "#5F9F95",
  successSoft: "rgba(95, 159, 149, 0.14)",

  warning: "rgba(232, 208, 168, 0.09)",
  warningText: "#D6C2A8",
  warningBorder: "rgba(232, 208, 168, 0.20)",

  danger: "#B98272",
  dangerSoft: "rgba(185, 130, 114, 0.14)",
  dangerBorder: "rgba(185, 130, 114, 0.28)",

  white: "#F6F4EE",
  black: "#03110D",
};

export type ThemeColors = typeof lightColors;

export const colors = lightColors;