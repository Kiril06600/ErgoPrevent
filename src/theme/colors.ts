export type ThemeColors = {
  mode: "light" | "dark";

  background: string;
  backgroundSoft: string;

  card: string;
  cardWarm: string;

  primary: string;
  primaryDark: string;
  primaryLight: string;

  secondary: string;
  secondaryLight: string;

  accent: string;
  accentSoft: string;

  turquoise: string;
  turquoiseSoft: string;
  turquoiseLight: string;

  text: string;
  textSoft: string;
  textMuted: string;

  border: string;

  success: string;
  successSoft: string;

  warning: string;
  warningText: string;
  warningBorder: string;

  danger: string;
  dangerSoft: string;
  dangerBorder: string;

  white: string;
  black: string;
};

export const lightColors: ThemeColors = {
  mode: "light",

  background: "transparent",
  backgroundSoft: "rgba(8, 45, 36, 0.08)",

  card: "rgba(255, 255, 255, 0.54)",
  cardWarm: "rgba(255, 255, 255, 0.42)",

  primary: "#082D24",
  primaryDark: "#041A14",
  primaryLight: "rgba(8, 45, 36, 0.12)",

  secondary: "#E9E1D4",
  secondaryLight: "rgba(8, 45, 36, 0.075)",

  accent: "#082D24",
  accentSoft: "rgba(8, 45, 36, 0.10)",

  turquoise: "#2F6F63",
  turquoiseSoft: "rgba(47, 111, 99, 0.15)",
  turquoiseLight: "rgba(47, 111, 99, 0.20)",

  text: "#082D24",
  textSoft: "rgba(8, 45, 36, 0.76)",
  textMuted: "rgba(8, 45, 36, 0.54)",

  border: "rgba(8, 45, 36, 0.18)",

  success: "#2F6F63",
  successSoft: "rgba(47, 111, 99, 0.15)",

  warning: "rgba(8, 45, 36, 0.075)",
  warningText: "#082D24",
  warningBorder: "rgba(8, 45, 36, 0.18)",

  danger: "#9B5F4F",
  dangerSoft: "rgba(155, 95, 79, 0.13)",
  dangerBorder: "rgba(155, 95, 79, 0.26)",

  white: "#FFFFFF",

  // Important : plusieurs boutons utilisent colors.black sur fond primary.
  // En mode clair, primary est vert foncé, donc black doit être crème.
  black: "#F7F1E7",
};

export const darkColors: ThemeColors = {
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

export const colors = lightColors;