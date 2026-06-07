import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n/config";
import App from "./App";
import { validateEnv } from "./config";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

validateEnv();

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

serviceWorkerRegistration.register();
