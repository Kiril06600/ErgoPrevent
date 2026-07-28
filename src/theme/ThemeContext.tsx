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

function getBaseBackground(mode: ThemeMode) {
  if (mode === "light") {
    return `
      radial-gradient(
        circle at 50% 12%,
        rgba(8, 45, 36, 0.10) 0%,
        rgba(8, 45, 36, 0.045) 16%,
        rgba(8, 45, 36, 0) 32%
      ),
      radial-gradient(
        circle at 90% 30%,
        rgba(47, 111, 99, 0.14) 0%,
        rgba(47, 111, 99, 0.045) 14%,
        rgba(47, 111, 99, 0) 28%
      ),
      radial-gradient(
        circle at 6% 78%,
        rgba(8, 45, 36, 0.08) 0%,
        rgba(8, 45, 36, 0.03) 14%,
        rgba(8, 45, 36, 0) 28%
      ),
      linear-gradient(
        145deg,
        #F4EDE1 0%,
        #E9E1D4 36%,
        #D8CEC0 72%,
        #C9CDBD 100%
      )
    `;
  }

  return `
    radial-gradient(
      circle at 52% 12%,
      rgba(255, 255, 255, 0.055) 0%,
      rgba(255, 255, 255, 0.035) 15%,
      rgba(255, 255, 255, 0) 30%
    ),
    radial-gradient(
      circle at 91% 28%,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.032) 13%,
      rgba(255, 255, 255, 0) 27%
    ),
    radial-gradient(
      circle at 69% 57%,
      rgba(255, 255, 255, 0.055) 0%,
      rgba(255, 255, 255, 0.03) 17%,
      rgba(255, 255, 255, 0) 34%
    ),
    radial-gradient(
      circle at 4% 37%,
      rgba(255, 255, 255, 0.052) 0%,
      rgba(255, 255, 255, 0.026) 12%,
      rgba(255, 255, 255, 0) 25%
    ),
    radial-gradient(
      circle at 8% 83%,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.025) 13%,
      rgba(255, 255, 255, 0) 27%
    ),
    linear-gradient(
      145deg,
      #082D24 0%,
      #0A3027 28%,
      #06221C 62%,
      #03130F 100%
    )
  `;
}

function getOverlayBackground(mode: ThemeMode) {
  if (mode === "light") {
    return `
      radial-gradient(
        circle at 50% 15%,
        rgba(8,45,36,0.08) 0%,
        rgba(8,45,36,0.028) 13%,
        rgba(8,45,36,0) 27%
      ),
      radial-gradient(
        circle at 84% 33%,
        rgba(47,111,99,0.11) 0%,
        rgba(47,111,99,0.032) 12%,
        rgba(47,111,99,0) 24%
      )
    `;
  }

  return `
    radial-gradient(
      circle at 50% 16%,
      rgba(255,255,255,0.08) 0%,
      rgba(255,255,255,0.035) 13%,
      rgba(255,255,255,0) 27%
    ),
    radial-gradient(
      circle at 86% 31%,
      rgba(255,255,255,0.07) 0%,
      rgba(255,255,255,0.03) 12%,
      rgba(255,255,255,0) 24%
    ),
    radial-gradient(
      circle at 70% 61%,
      rgba(255,255,255,0.065) 0%,
      rgba(255,255,255,0.028) 15%,
      rgba(255,255,255,0) 31%
    ),
    radial-gradient(
      circle at 5% 39%,
      rgba(255,255,255,0.06) 0%,
      rgba(255,255,255,0.027) 11%,
      rgba(255,255,255,0) 23%
    ),
    radial-gradient(
      circle at 7% 84%,
      rgba(255,255,255,0.055) 0%,
      rgba(255,255,255,0.024) 12%,
      rgba(255,255,255,0) 25%
    )
  `;
}

function applyGlobalWebBackground(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const baseBackground = getBaseBackground(mode).trim();
  const overlayBackground = getOverlayBackground(mode).trim();
  const textColor = mode === "dark" ? "#F6F1E8" : "#082D24";

  document.documentElement.style.background = baseBackground;
  document.body.style.background = baseBackground;
  document.body.style.color = textColor;

  let styleTag = document.getElementById(
    "ergoprevent-global-background"
  ) as HTMLStyleElement | null;

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "ergoprevent-global-background";
    document.head.appendChild(styleTag);
  }

  styleTag.innerHTML = `
    html,
    body {
      min-height: 100% !important;
      margin: 0 !important;
      background: ${baseBackground} !important;
      background-repeat: no-repeat !important;
      background-size: cover !important;
      background-attachment: fixed !important;
      color: ${textColor} !important;
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        system-ui,
        sans-serif !important;
    }

    #root {
      min-height: 100vh !important;
      position: relative !important;
      overflow-x: hidden !important;
      background: ${baseBackground} !important;
      background-repeat: no-repeat !important;
      background-size: cover !important;
      background-attachment: fixed !important;
      isolation: isolate !important;
    }

    #root::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: ${overlayBackground};
      opacity: 1;
    }

    #root > div {
      position: relative !important;
      z-index: 1 !important;
      min-height: 100vh !important;
      background: transparent !important;
      background-color: transparent !important;
    }

    #root > div > div,
    #root > div > div > div,
    #root > div > div > div > div {
      background-color: transparent !important;
    }

    #root [style*="background-color: rgb(255, 255, 255)"],
    #root [style*="background-color: white"],
    #root [style*="background: rgb(255, 255, 255)"],
    #root [style*="background: white"] {
      background-color: transparent !important;
      background: transparent !important;
    }
  `;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedMode = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedMode === "light" || savedMode === "dark") {
      setMode(savedMode);
      applyGlobalWebBackground(savedMode);
      return;
    }

    applyGlobalWebBackground("dark");
  }, []);

  useEffect(() => {
    applyGlobalWebBackground(mode);
  }, [mode]);

  function setThemeMode(nextMode: ThemeMode) {
    setMode(nextMode);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    }

    applyGlobalWebBackground(nextMode);
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
    [mode, colors]
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