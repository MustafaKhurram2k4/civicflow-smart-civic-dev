import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeModeContext = createContext(null);
const THEME_KEY = "civicflow-theme-preference";

function getSystemMode() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeModeProvider({ children }) {
  const [preference, setPreference] = useState(() => localStorage.getItem(THEME_KEY) || "system");
  const [systemMode, setSystemMode] = useState(getSystemMode);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;
    const onChange = (event) => setSystemMode(event.matches ? "dark" : "light");
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, preference);
  }, [preference]);

  useEffect(() => {
    document.documentElement.dataset.cfThemePreference = preference;
    document.documentElement.dataset.cfTheme = mode;
    document.documentElement.classList.toggle("cf-theme-dark", mode === "dark");
  }, [preference, mode]);

  const mode = preference === "system" ? systemMode : preference;
  const toggleMode = () => setPreference(mode === "dark" ? "light" : "dark");

  const value = useMemo(() => ({
    mode,
    preference,
    setPreference,
    toggleMode,
  }), [mode, preference]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
