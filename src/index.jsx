import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n/config";
import App from "./App";
import { validateEnv } from "./config";
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
