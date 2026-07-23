import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { darkColors, lightColors, ThemeColors } from "./colors";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const THEME_STORAGE_KEY = "ergoprevent_theme_mode";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedMode = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedMode === "light" || savedMode === "dark") {
      setMode(savedMode);
    }
  }, []);

  function setThemeMode(nextMode: ThemeMode) {
    setMode(nextMode);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    }
  }

  function toggleTheme() {
    setThemeMode(mode === "dark" ? "light" : "dark");
  }

  const colors = mode === "dark" ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      mode,
      colors,
      toggleTheme,
      setThemeMode,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }

  return context;
}