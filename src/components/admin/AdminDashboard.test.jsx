import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../../i18n/config";
import { AdminDashboard } from "./AdminDashboard";
import { ToastProvider } from "../../hooks/useToast";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: { dashboard: vi.fn() },
}));

describe("AdminDashboard", () => {
  it("shows beat and loop catalogs with their own counts", async () => {
    adminService.dashboard.mockResolvedValue({
      data: { beatPlaylists: 4, loopPlaylists: 2, beats: 40, loops: 13, samplepacks: 3, samples: 90, users: 7 },
    });

    render(
      <HelmetProvider>
        <MemoryRouter>
          <ToastProvider>
            <AdminDashboard />
          </ToastProvider>
        </MemoryRouter>
      </HelmetProvider>
    );

    const card = (key) => {
      const label = i18n.t(key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return screen.findByRole("link", { name: new RegExp(`^${label}`) });
    };

    // Antes mostraba la cantidad de loops (13) en la card de catálogos de loops.
    expect(within(await card("admin.dashboard.cardCatalogsLoops")).getByText("2")).toBeInTheDocument();
    expect(within(await card("admin.dashboard.cardCatalogsBeats")).getByText("4")).toBeInTheDocument();
  });

  it("shows an error instead of zeros when the stats fail to load, and retries", async () => {
    adminService.dashboard.mockReset();
    adminService.dashboard
      .mockRejectedValueOnce(new Error("Network Error"))
      .mockResolvedValue({ data: { beatPlaylists: 4, loopPlaylists: 2, beats: 40, loops: 13, samplepacks: 3, samples: 90, users: 7 } });

    render(
      <HelmetProvider>
        <MemoryRouter>
          <ToastProvider>
            <AdminDashboard />
          </ToastProvider>
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(await screen.findByText(i18n.t("admin.dashboard.loadError"))).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: new RegExp(`^${i18n.t("admin.dashboard.cardUsers")}`) })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: i18n.t("admin.dashboard.retry") }));
    expect(await screen.findByText("90")).toBeInTheDocument();
  });
});
