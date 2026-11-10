import { vi } from "vitest";

vi.mock("@sentry/react", () => ({ init: vi.fn(), captureException: vi.fn() }));
import * as Sentry from "@sentry/react";
import { initMonitoring, reportError, resetMonitoringForTests } from "./monitoring";

describe("monitoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMonitoringForTests();
  });

  it("does nothing without a DSN", async () => {
    expect(await initMonitoring({ dsn: "", environment: "production" })).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();
    await reportError(new Error("lost"));
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("starts Sentry with the DSN, the environment and no personal data", async () => {
    expect(await initMonitoring({ dsn: "https://k@o1.ingest.sentry.io/2", environment: "production" })).toBe(true);
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://k@o1.ingest.sentry.io/2",
        environment: "production",
        sendDefaultPii: false,
      })
    );
  });

  it("reports an error with the React component stack once started", async () => {
    await initMonitoring({ dsn: "https://k@o1.ingest.sentry.io/2", environment: "production" });
    const err = new Error("render broke");
    await reportError(err, { componentStack: "at Beats" });
    expect(Sentry.captureException).toHaveBeenCalledWith(err, {
      contexts: { react: { componentStack: "at Beats" } },
    });
  });
});
