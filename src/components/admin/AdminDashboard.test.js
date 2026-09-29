import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../../i18n/config";
import { AdminDashboard } from "./AdminDashboard";
import { ToastProvider } from "../../hooks/useToast";
import { adminService } from "../../services/api";

jest.mock("../../services/api", () => ({
  adminService: { dashboard: jest.fn() },
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
});
