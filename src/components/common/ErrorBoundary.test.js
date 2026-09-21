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

describe("ErrorBoundary chunk-load error handling", () => {
  let reloadSpy;
  let originalLocation;

  const ChunkBoom = () => {
    throw new Error("Loading chunk 42 failed.");
  };

  beforeEach(() => {
    sessionStorage.clear();
    reloadSpy = jest.fn();
    originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, reload: reloadSpy };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("reloads once when a stale-deploy chunk-load error is caught", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ChunkBoom />
      </ErrorBoundary>
    );

    expect(reloadSpy).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("chunkReloaded")).toBe("1");

    consoleSpy.mockRestore();
  });

  it("does not reload again (and shows the normal fallback) if a chunk error recurs after the first reload", () => {
    sessionStorage.setItem("chunkReloaded", "1");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ChunkBoom />
      </ErrorBoundary>
    );

    expect(reloadSpy).not.toHaveBeenCalled();
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
