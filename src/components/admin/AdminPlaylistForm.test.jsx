import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../../i18n/config";
import { AdminPlaylistForm } from "./AdminPlaylistForm";
import { ToastProvider } from "../../hooks/useToast";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: {
    playlists: { list: vi.fn(), update: vi.fn(), create: vi.fn() },
    upload: { file: vi.fn() },
  },
}));

const renderEdit = (path, routePath, type) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <Routes>
          <Route path={routePath} element={<AdminPlaylistForm type={type} />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  );

describe("AdminPlaylistForm in edit mode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads a beats catalog from the playlists endpoint", async () => {
    adminService.playlists.list.mockResolvedValue({
      data: [{ _id: "pl1", title: "Summer 2k25", description: "desc", imageUrl: "a", backgroundVideo: "b", type: "beats" }],
    });

    renderEdit("/admin/playlists/pl1/edit", "/admin/playlists/:id/edit", "beats");

    expect(await screen.findByDisplayValue("Summer 2k25")).toBeInTheDocument();
  });

  it("ties labels to their inputs", async () => {
    adminService.playlists.list.mockResolvedValue({ data: [] });
    renderEdit("/admin/playlists/pl1/edit", "/admin/playlists/:id/edit", "beats");

    expect(await screen.findByLabelText(/t[ií]tulo|title/i)).toHaveAttribute("name", "title");
  });
});
