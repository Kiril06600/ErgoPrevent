export const lightColors = {
  mode: "light",

  background: "#F8F5EF",
  backgroundSoft: "rgba(255, 255, 255, 0.35)",

  card: "rgba(255, 255, 255, 0.58)",
  cardWarm: "rgba(255, 255, 255, 0.42)",

  primary: "#D8C4B6",
  primaryDark: "#C8AA98",
  primaryLight: "rgba(216, 196, 182, 0.35)",

  secondary: "#163028",
  secondaryLight: "rgba(22, 48, 40, 0.07)",

  accent: "#D8C4B6",
  accentSoft: "rgba(216, 196, 182, 0.24)",

  turquoise: "#5F9F95",
  turquoiseSoft: "rgba(95, 159, 149, 0.12)",
  turquoiseLight: "rgba(95, 159, 149, 0.18)",

  text: "#03110D",
  textSoft: "#4D5A53",
  textMuted: "#7A807A",

  border: "rgba(163, 133, 96, 0.22)",

  success: "#5F9F95",
  successSoft: "rgba(95, 159, 149, 0.12)",

  warning: "rgba(255, 246, 232, 0.64)",
  warningText: "#7D6548",
  warningBorder: "rgba(232, 208, 168, 0.55)",

  danger: "#B98272",
  dangerSoft: "rgba(255, 242, 239, 0.58)",
  dangerBorder: "rgba(232, 196, 184, 0.55)",

  white: "#FFFFFF",
  black: "#03110D",
};

export const darkColors = {
  mode: "dark",

  background: "#03110D",
  backgroundSoft: "rgba(224, 224, 224, 0.03)",

  card: "rgba(224, 224, 224, 0.055)",
  cardWarm: "rgba(224, 224, 224, 0.035)",

  primary: "#F5EEDF",
  primaryDark: "#E2D8C8",
  primaryLight: "rgba(245, 238, 223, 0.12)",

  secondary: "#163028",
  secondaryLight: "rgba(224, 224, 224, 0.06)",

  accent: "#F5EEDF",
  accentSoft: "rgba(245, 238, 223, 0.10)",

  turquoise: "#5F9F95",
  turquoiseSoft: "rgba(95, 159, 149, 0.12)",
  turquoiseLight: "rgba(95, 159, 149, 0.18)",

  text: "#E0E0E0",
  textSoft: "#C6C2BA",
  textMuted: "#9E968A",

  border: "rgba(224, 224, 224, 0.12)",

  success: "#5F9F95",
  successSoft: "rgba(95, 159, 149, 0.12)",

  warning: "rgba(232, 208, 168, 0.08)",
  warningText: "#D6C2A8",
  warningBorder: "rgba(232, 208, 168, 0.18)",

  danger: "#B98272",
  dangerSoft: "rgba(185, 130, 114, 0.12)",
  dangerBorder: "rgba(185, 130, 114, 0.24)",

  white: "#E0E0E0",
  black: "#03110D",
};

export type ThemeColors = typeof lightColors;

// Couleurs par défaut pour les anciennes pages pas encore migrées
export const colors = lightColors;