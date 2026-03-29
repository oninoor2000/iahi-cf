import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { THEME_MODE_TYPE } from "@/lib/constants";
import { setValueToCookieFn } from "@/server/cookie.functions";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: THEME_MODE_TYPE;
  storageKey?: string;
};

type ThemeProviderState = {
  themeMode: THEME_MODE_TYPE;
  resolvedTheme: "light" | "dark";
  setThemeMode: (theme: THEME_MODE_TYPE) => void;
};

const DEFAULT_STORAGE_KEY = "iahi-theme";

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

const resolveTheme = (themeMode: THEME_MODE_TYPE): "light" | "dark" => {
  if (themeMode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return themeMode;
};

const applyThemeMode = (themeMode: THEME_MODE_TYPE) => {
  const resolved = resolveTheme(themeMode);
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);

  if (themeMode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", themeMode);
  }

  root.style.colorScheme = resolved;
};

const getInitialThemeMode = (
  storageKey: string,
  defaultTheme: THEME_MODE_TYPE,
): THEME_MODE_TYPE => {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const stored = window.localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : defaultTheme;
};

export const ThemeProvider = ({
  children,
  defaultTheme = "system",
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) => {
  const [themeMode, setThemeModeState] = useState<THEME_MODE_TYPE>(() =>
    getInitialThemeMode(storageKey, defaultTheme),
  );
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    applyThemeMode(themeMode);
    setResolvedTheme(resolveTheme(themeMode));
    window.localStorage.setItem(storageKey, themeMode);
  }, [storageKey, themeMode]);

  useEffect(() => {
    if (themeMode !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyThemeMode("system");
      setResolvedTheme(resolveTheme("system"));
    };

    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [themeMode]);

  const value = useMemo<ThemeProviderState>(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode: (nextTheme) => {
        setThemeModeState(nextTheme);
        void setValueToCookieFn({
          data: {
            key: storageKey,
            value: nextTheme,
            options: { path: "/", maxAge: 60 * 60 * 24 * 365 },
          },
        });
      },
    }),
    [resolvedTheme, storageKey, themeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
