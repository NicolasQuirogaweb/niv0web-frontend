import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../../i18n/config";
import { AdminPlaylistForm } from "./AdminPlaylistForm";
import { ToastProvider } from "../../hooks/useToast";
import { adminService } from "../../services/api";

jest.mock("../../services/api", () => ({
  adminService: {
    playlists: { list: jest.fn(), update: jest.fn(), create: jest.fn() },
    samplepacks: { list: jest.fn(), update: jest.fn(), create: jest.fn() },
    upload: { file: jest.fn() },
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
  beforeEach(() => jest.clearAllMocks());

  it("loads a sample pack from the sample packs endpoint (it used to come up empty)", async () => {
    adminService.samplepacks.list.mockResolvedValue({
      data: [{ _id: "sp1", title: "Drum Kit Vol. 1", description: "Kicks and snares", imageUrl: "https://x/img.png" }],
    });

    renderEdit("/admin/samplepacks/sp1/edit", "/admin/samplepacks/:id/edit", "samples");

    expect(await screen.findByDisplayValue("Drum Kit Vol. 1")).toBeInTheDocument();
    expect(adminService.samplepacks.list).toHaveBeenCalledTimes(1);
    expect(adminService.playlists.list).not.toHaveBeenCalled();
  });

  it("loads a beats catalog from the playlists endpoint", async () => {
    adminService.playlists.list.mockResolvedValue({
      data: [{ _id: "pl1", title: "Summer 2k25", description: "desc", imageUrl: "a", backgroundVideo: "b", type: "beats" }],
    });

    renderEdit("/admin/playlists/pl1/edit", "/admin/playlists/:id/edit", "beats");

    expect(await screen.findByDisplayValue("Summer 2k25")).toBeInTheDocument();
    expect(adminService.samplepacks.list).not.toHaveBeenCalled();
  });

  it("ties labels to their inputs", async () => {
    adminService.playlists.list.mockResolvedValue({ data: [] });
    renderEdit("/admin/playlists/pl1/edit", "/admin/playlists/:id/edit", "beats");

    expect(await screen.findByLabelText(/t[ií]tulo|title/i)).toHaveAttribute("name", "title");
  });
});
