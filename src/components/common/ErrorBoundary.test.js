import { render, screen } from "@testing-library/react";
import "../../i18n/config";
import { ErrorBoundary } from "./ErrorBoundary";

const Boom = () => {
  throw new Error("raw internal stack trace detail");
};

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("shows a generic i18n fallback message and never leaks the raw error message", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(screen.queryByText(/raw internal stack trace detail/)).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
