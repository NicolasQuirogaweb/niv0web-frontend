import { render, screen, act, fireEvent } from "@testing-library/react";
import i18n from "../../i18n/config";
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

// El ZIP se rearma solo después de cada cambio (backend, zipAutoBuild): el panel muestra
// en qué está y se actualiza solo, sin recargar la página.
describe("AdminZipPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage("es");
  });
  afterEach(() => vi.useRealTimers());

  it("says there is no ZIP yet", () => {
    renderPanel({ build: { status: "idle" } });
    expect(screen.getByText(/todavía no hay zip/i)).toBeInTheDocument();
  });

  it("an up-to-date ZIP says so, with size and download link", () => {
    renderPanel(ready);
    expect(screen.getByText(/zip al día/i)).toBeInTheDocument();
    expect(screen.getByText(/50 MB/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /descargar/i })).toHaveAttribute("href", ready.url);
  });

  it("omits the date instead of showing Invalid Date when builtAt is missing", () => {
    renderPanel({ ...ready, builtAt: null });
    expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
  });

  it("after a change it says the ZIP is being updated on its own, not 'rebuild it'", () => {
    renderPanel({ ...ready, stale: true });
    expect(screen.getByText(/actualizando el zip con tus cambios/i)).toBeInTheDocument();
    expect(screen.queryByText(/volvé a armar/i)).not.toBeInTheDocument();
  });

  it("while building it says it is updating and the button waits", () => {
    renderPanel({ ...ready, build: { status: "building" } });
    expect(screen.getByText(/actualizando el zip/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("a failure is one clear line plus the sample that failed, with a retry button", () => {
    renderPanel({ ...ready, build: { status: "failed", error: "No se pudo armar el ZIP: ricky fort 808 @niv0 (socket hang up)" } });
    expect(screen.getByText(/no se pudo actualizar el zip/i)).toBeInTheDocument();
    expect(screen.getByText("ricky fort 808 @niv0 (socket hang up)")).toBeInTheDocument();
    expect(screen.queryByText(/No se pudo armar el ZIP:/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeEnabled();
  });

  it("a failure without details still reads well", () => {
    renderPanel({ ...ready, build: { status: "failed", error: null } });
    expect(screen.getByText(/no se pudo actualizar el zip/i)).toBeInTheDocument();
  });

  it.each([
    ["building", { build: { status: "building" } }],
    ["stale (rebuild coming)", { stale: true }],
    ["failed (retrying on its own)", { build: { status: "failed", error: "x" } }],
  ])("refreshes itself every 5 s while %s, and stops on unmount", (_label, extra) => {
    vi.useFakeTimers();
    const { onRefresh, unmount } = renderPanel({ ...ready, ...extra });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    unmount();
    act(() => { vi.advanceTimersByTime(15000); });
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("does not poll when the ZIP is up to date", () => {
    vi.useFakeTimers();
    const { onRefresh } = renderPanel(ready);
    act(() => { vi.advanceTimersByTime(20000); });
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("can still rebuild by hand", async () => {
    adminService.samplepacks.buildZip.mockResolvedValue({ data: { status: "building" } });
    const { onRefresh } = renderPanel(ready);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /rearmar ahora/i })); });
    expect(adminService.samplepacks.buildZip).toHaveBeenCalledWith("p1");
    expect(onRefresh).toHaveBeenCalled();
  });

  it("has the English texts", () => {
    for (const key of ["upToDate", "updating", "failed", "retry", "rebuild"]) {
      expect(i18n.exists(`admin.samplePacks.zip.${key}`, { lng: "en" })).toBe(true);
    }
  });
});
