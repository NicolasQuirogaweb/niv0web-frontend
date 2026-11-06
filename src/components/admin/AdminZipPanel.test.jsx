import { render, screen, act, fireEvent } from "@testing-library/react";
import "../../i18n/config";
import { AdminZipPanel } from "./AdminZipPanel";
import { ToastProvider } from "../../hooks/useToast";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: { samplepacks: { buildZip: vi.fn() } },
}));

const ready = { url: "https://b2/zip.zip", bytes: 52428800, builtAt: "2026-11-01T10:00:00Z", stale: false, build: { status: "idle" } };

const renderPanel = (zip, onRefresh = vi.fn()) => {
  const utils = render(
    <ToastProvider>
      <AdminZipPanel pack={{ _id: "p1", zip }} onRefresh={onRefresh} />
    </ToastProvider>
  );
  return { ...utils, onRefresh };
};

describe("AdminZipPanel", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.useRealTimers());

  it("says there is no ZIP yet", () => {
    renderPanel({ build: { status: "idle" } });
    expect(screen.getByText(/todavía no hay zip/i)).toBeInTheDocument();
  });

  it("shows size and link when ready", () => {
    renderPanel(ready);
    expect(screen.getByText(/50 MB/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", ready.url);
  });

  it("omits the date instead of showing Invalid Date when builtAt is missing", () => {
    renderPanel({ ...ready, builtAt: null });
    expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
    expect(screen.getByText(/50 MB/)).toBeInTheDocument();
  });

  it("warns when the ZIP is stale", () => {
    renderPanel({ ...ready, stale: true });
    expect(screen.getByText(/hay cambios: volvé a armar el zip/i)).toBeInTheDocument();
  });

  it("shows the build error when it failed", () => {
    renderPanel({ ...ready, build: { status: "failed", error: "B2 timeout" } });
    expect(screen.getByText(/B2 timeout/)).toBeInTheDocument();
  });

  it("shows building and disables the button", () => {
    renderPanel({ ...ready, build: { status: "building" } });
    expect(screen.getByText(/armando zip…/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /armar zip/i })).toBeDisabled();
  });

  it("polls onRefresh every 5s while building and stops on unmount", () => {
    vi.useFakeTimers();
    const { onRefresh, unmount } = renderPanel({ ...ready, build: { status: "building" } });
    expect(onRefresh).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    unmount();
    act(() => { vi.advanceTimersByTime(15000); });
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("does not poll when idle", () => {
    vi.useFakeTimers();
    const { onRefresh } = renderPanel(ready);
    act(() => { vi.advanceTimersByTime(20000); });
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("builds the ZIP on click", async () => {
    adminService.samplepacks.buildZip.mockResolvedValue({ data: { status: "building" } });
    const { onRefresh } = renderPanel(ready);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /armar zip/i })); });
    expect(adminService.samplepacks.buildZip).toHaveBeenCalledWith("p1");
    expect(onRefresh).toHaveBeenCalled();
  });
});
