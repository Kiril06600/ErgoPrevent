export const lightColors = {
  mode: "light",

  background: "#F8F5EF",
  backgroundSoft: "#FFFFFF",

  card: "#FFFFFF",
  cardWarm: "#FBF7F0",

  primary: "#D8C4B6",
  primaryDark: "#C8AA98",
  primaryLight: "#EFE3DA",

  secondary: "#163028",
  secondaryLight: "#EEF4F1",

  accent: "#D8C4B6",
  accentSoft: "#F4EAE2",

  turquoise: "#5F9F95",
  turquoiseSoft: "#EDF8F6",
  turquoiseLight: "#D7EFEB",

  text: "#03110D",
  textSoft: "#4D5A53",
  textMuted: "#7A807A",

  border: "#E6DED3",

  success: "#5F9F95",
  successSoft: "#EDF8F6",

  warning: "#FFF6E8",
  warningText: "#7D6548",
  warningBorder: "#E8D0A8",

  danger: "#B98272",
  dangerSoft: "#FFF2EF",
  dangerBorder: "#E8C4B8",

  white: "#FFFFFF",
  black: "#03110D",
};

export const darkColors = {
  mode: "dark",

  background: "#03110D",
  backgroundSoft: "#071812",

  card: "#0A1814",
  cardWarm: "#101C17",

  primary: "#F5EEDF",
  primaryDark: "#F5EEDF",
  primaryLight: "#3B3124",

  secondary: "#163028",
  secondaryLight: "#1D3A31",

  accent: "#F5EEDF",
  accentSoft: "#211C15",

  turquoise: "#5F9F95",
  turquoiseSoft: "#10231D",
  turquoiseLight: "#163028",

  text: "#E0E0E0",
  textSoft: "#C6C2BA",
  textMuted: "#9E968A",

  border: "#263A33",

  success: "#5F9F95",
  successSoft: "#10231D",

  warning: "#211C15",
  warningText: "#D6C2A8",
  warningBorder: "#3A3023",

  danger: "#B98272",
  dangerSoft: "#271814",
  dangerBorder: "#5A352C",

  white: "#E0E0E0",
  black: "#03110D",
};

export type ThemeColors = typeof lightColors;

// Couleurs par défaut pour les anciennes pages pas encore migrées
export const colors = lightColors;