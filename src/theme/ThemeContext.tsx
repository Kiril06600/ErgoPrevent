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
  if (mode === "dark") {
    return `
      linear-gradient(
        to bottom left,
        #203C33 0%,
        #142D26 28%,
        #0A1C17 58%,
        #04100D 82%,
        #010403 100%
      )
    `;
  }

  return `
      linear-gradient(
        to bottom left,
        #FFFFFF 0%,
        #FFFFFF 22%,
        #FDF9F2 48%,
        #F3EBDC 76%,
        #E8EFD8 100%
      )
    `;
}

function getArcBackground(mode: ThemeMode) {
  if (mode === "dark") {
    return `
      radial-gradient(
        ellipse at 82% 12%,
        rgba(58, 116, 96, 0.82) 0%,
        rgba(34, 78, 65, 0.64) 28%,
        rgba(15, 43, 35, 0.46) 50%,
        rgba(4, 16, 13, 0.18) 70%,
        rgba(1, 4, 3, 0) 86%
      ),
      linear-gradient(
        to bottom left,
        rgba(58, 116, 96, 0.24) 0%,
        rgba(15, 43, 35, 0.20) 45%,
        rgba(1, 4, 3, 0.20) 100%
      )
    `;
  }

  return `
      radial-gradient(
        ellipse at 82% 12%,
        rgba(120, 148, 112, 0.22) 0%,
        rgba(166, 188, 150, 0.15) 30%,
        rgba(216, 228, 201, 0.09) 54%,
        rgba(248, 241, 231, 0.03) 74%,
        rgba(255, 253, 248, 0) 88%
      ),
      linear-gradient(
        to bottom left,
        rgba(142, 170, 130, 0.05) 0%,
        rgba(230, 238, 220, 0.04) 45%,
        rgba(255, 253, 248, 0.01) 100%
      )
    `;
}

function applyGlobalWebBackground(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const baseBackground = getBaseBackground(mode).trim();
  const arcBackground = getArcBackground(mode).trim();

  let styleTag = document.getElementById(
    "ergoprevent-global-background"
  ) as HTMLStyleElement | null;

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "ergoprevent-global-background";
    document.head.appendChild(styleTag);
  }

  document.documentElement.style.setProperty(
    "--ergoprevent-arc-opacity",
    mode === "light" ? "0.045" : "0.58"
  );
  document.documentElement.style.setProperty("--ergoprevent-arc-scale", "0.92");
  document.documentElement.style.setProperty("--ergoprevent-arc-x", "0px");
  document.documentElement.style.setProperty("--ergoprevent-arc-y", "0px");

  styleTag.innerHTML = `
    html,
    body {
      min-height: 100% !important;
      margin: 0 !important;
      background: ${baseBackground} !important;
      background-repeat: no-repeat !important;
      background-size: cover !important;
      background-attachment: fixed !important;
    }

    #root {
      min-height: 100vh !important;
      position: relative !important;
      overflow-x: hidden !important;
      background: ${baseBackground} !important;
      isolation: isolate !important;
    }

    #root::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: ${baseBackground};
      background-repeat: no-repeat;
      background-size: cover;
      background-attachment: fixed;
    }

    #root::after {
      content: "";
      position: fixed;
      top: -52vh;
      right: -58vw;
      width: 150vw;
      height: 150vh;
      z-index: 0;
      pointer-events: none;
      border-radius: 9999px;
      background: ${arcBackground};
      opacity: var(--ergoprevent-arc-opacity);
      transform:
        translate3d(
          var(--ergoprevent-arc-x),
          var(--ergoprevent-arc-y),
          0
        )
        scale(var(--ergoprevent-arc-scale));
      transform-origin: 82% 12%;
      transition:
        opacity 0.08s linear,
        transform 0.08s linear;
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

function applyScrollEffect(mode: ThemeMode) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  let frame: number | null = null;

  function getScrollProgress(event?: Event) {
    let scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    let maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    const target = event?.target as HTMLElement | null;

    if (
      target &&
      target.scrollHeight &&
      target.clientHeight &&
      target.scrollHeight > target.clientHeight
    ) {
      scrollTop = target.scrollTop;
      maxScroll = target.scrollHeight - target.clientHeight;
    }

    if (maxScroll <= 0) {
      return 0;
    }

    const rawProgress = Math.min(1, Math.max(0, scrollTop / maxScroll));

    return Math.min(1, Math.pow(rawProgress * 1.55, 0.78));
  }

  function update(event?: Event) {
    if (frame) {
      cancelAnimationFrame(frame);
    }

    frame = requestAnimationFrame(() => {
      const progress = getScrollProgress(event);

      if (mode === "light") {
        const arcOpacity = 0.045 + progress * 0.11;
        const arcScale = 0.92 + progress * 0.20;
        const arcX = -progress * 48;
        const arcY = progress * 68;

        document.documentElement.style.setProperty(
          "--ergoprevent-arc-opacity",
          String(arcOpacity)
        );
        document.documentElement.style.setProperty(
          "--ergoprevent-arc-scale",
          String(arcScale)
        );
        document.documentElement.style.setProperty(
          "--ergoprevent-arc-x",
          `${arcX}px`
        );
        document.documentElement.style.setProperty(
          "--ergoprevent-arc-y",
          `${arcY}px`
        );
      } else {
        const arcOpacity = 0.58 + progress * 0.18;
        const arcScale = 0.95 + progress * 0.20;
        const arcX = -progress * 70;
        const arcY = progress * 90;

        document.documentElement.style.setProperty(
          "--ergoprevent-arc-opacity",
          String(arcOpacity)
        );
        document.documentElement.style.setProperty(
          "--ergoprevent-arc-scale",
          String(arcScale)
        );
        document.documentElement.style.setProperty(
          "--ergoprevent-arc-x",
          `${arcX}px`
        );
        document.documentElement.style.setProperty(
          "--ergoprevent-arc-y",
          `${arcY}px`
        );
      }
    });
  }

  update();

  window.addEventListener("scroll", update, true);
  window.addEventListener("resize", update);

  return () => {
    window.removeEventListener("scroll", update, true);
    window.removeEventListener("resize", update);

    if (frame) {
      cancelAnimationFrame(frame);
    }
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

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

    applyGlobalWebBackground("light");
  }, []);

  useEffect(() => {
    applyGlobalWebBackground(mode);
    const cleanup = applyScrollEffect(mode);

    return cleanup;
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