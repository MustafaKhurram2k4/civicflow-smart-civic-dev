// -----------------------------------------------------------------------------
// vite.config.js — Vite + React configuration
// -----------------------------------------------------------------------------
// The React plugin enables Vite's modern JSX transform. Keep this plugin enabled
// while this project is a React + Vite application.
// -----------------------------------------------------------------------------
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: "localhost", port: 5173 },
});
