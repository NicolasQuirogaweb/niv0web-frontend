import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Mismo puerto que con CRA: el CORS del backend y los "Authorized JavaScript
    // origins" del client de Google están configurados para localhost:3000.
    port: 3000,
    strictPort: true,
  },
  preview: { port: 3000 },
  build: {
    outDir: "build",
    sourcemap: false,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    css: false,
  },
});
