// -----------------------------------------------------------------------------
// ThemeModeContext.jsx — App-wide light/dark mode
// -----------------------------------------------------------------------------
// The theme preference lives here instead of inside individual pages. That means
// every screen follows the same visual mode and the choice can be remembered.
// The backend does not need to know about this preference unless the team later
// decides to sync user settings server-side.
// -----------------------------------------------------------------------------

import { createContext, useContext, useMemo, useState } from "react";

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("civicflow-theme") || "light");

  const toggleMode = () => {
    setMode((current) => {
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem("civicflow-theme", next);
      return next;
    });
  };

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
