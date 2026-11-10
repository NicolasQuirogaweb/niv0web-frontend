import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n/config";
import App from "./App";
import { validateEnv, SENTRY_DSN } from "./config";
import { initMonitoring } from "./utils/monitoring";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { applyAccent, loadAccentHue } from "./utils/theme";

validateEnv();
// El color elegido se aplica antes del primer render, así no aparece el ámbar y después cambia.
applyAccent(loadAccentHue());

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);

// Sentry se carga después del primer render para no frenar la carga inicial.
initMonitoring({ dsn: SENTRY_DSN, environment: import.meta.env.VITE_VERCEL_ENV || import.meta.env.MODE });
