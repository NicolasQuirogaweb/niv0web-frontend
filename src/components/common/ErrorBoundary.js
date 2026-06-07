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
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="error-boundary">
          <h2>{i18n.t("errorBoundary.title")}</h2>
          <p>{this.state.error?.message || i18n.t("errorBoundary.message")}</p>
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
