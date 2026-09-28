// -----------------------------------------------------------------------------
// main.jsx
// -----------------------------------------------------------------------------
// This is the entry point of the React application.
// It creates the React root and wraps the application with the providers that
// the rest of the project needs:
//
// 1. I18nextProvider  -> makes translations available everywhere.
// 2. ThemeProvider    -> provides the Material UI design system.
// 3. BrowserRouter    -> enables client-side page navigation without full reloads.
//
// Backend developers normally do NOT need to modify this file.
// -----------------------------------------------------------------------------

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { I18nextProvider } from "react-i18next";
import App from "./App";
import i18n from "./i18n/i18n";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeModeProvider, useThemeMode } from "./theme/ThemeModeContext";

function AppProviders() {
  const { mode } = useThemeMode();
  const dark = mode === "dark";

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: dark ? "#7eb7ee" : "#315f8c" },
      secondary: { main: dark ? "#a99cff" : "#6d5dfc" },
      success: { main: dark ? "#67c8a8" : "#2e8b72" },
      warning: { main: dark ? "#efb85b" : "#d58b32" },
      error: { main: dark ? "#f07d89" : "#c94b59" },
      background: { default: dark ? "#151c26" : "#e7edf4", paper: dark ? "#1b2430" : "#e7edf4" },
      text: { primary: dark ? "#edf3fb" : "#233044", secondary: dark ? "#aebbd0" : "#66758a" }
    },
    typography: {
      fontFamily: '"Inter", "Noto Sans Devanagari", "Noto Sans", system-ui, sans-serif',
      h1: { fontWeight: 800, letterSpacing: "-0.04em" },
      h2: { fontWeight: 800, letterSpacing: "-0.035em" },
      h3: { fontWeight: 750, letterSpacing: "-0.025em" },
      button: { textTransform: "none", fontWeight: 700 }
    },
    shape: { borderRadius: 14 },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 14 } } }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ThemeModeProvider>
          <AppProviders />
        </ThemeModeProvider>
      </I18nextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);