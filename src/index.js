import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { validateEnv } from "./config";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

validateEnv();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
