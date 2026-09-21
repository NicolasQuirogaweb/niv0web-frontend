import React from "react";
import i18n from "i18next";
import "./ErrorBoundary.css";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);

    // After a new deploy, a browser with a stale cached shell (service
    // worker or otherwise) can try to fetch a JS chunk whose hash no
    // longer exists on the server, throwing here instead of navigating.
    // Reload once to pick up the current build instead of showing a
    // dead screen; guarded so a genuinely broken deploy doesn't loop.
    const isChunkError = /loading chunk|dynamically imported module|importing a module script failed/i.test(
      error?.message || ""
    );
    if (isChunkError && !sessionStorage.getItem("chunkReloaded")) {
      sessionStorage.setItem("chunkReloaded", "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="error-boundary">
          <h2>{i18n.t("errorBoundary.title")}</h2>
          <p>{i18n.t("errorBoundary.message")}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            }}
          >
            {i18n.t("errorBoundary.goHome")}
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
