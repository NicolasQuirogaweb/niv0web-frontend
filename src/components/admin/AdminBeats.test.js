import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../../i18n/config";
import { AdminBeats } from "./AdminBeats";
import { ToastProvider } from "../../hooks/useToast";
import { ConfirmProvider } from "../../hooks/useConfirm";
import { adminService } from "../../services/api";

jest.mock("../../services/api", () => ({
  adminService: {
    playlists: { list: jest.fn() },
    beats: {
      list: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      batch: jest.fn(),
    },
    upload: { file: jest.fn(), batch: jest.fn() },
  },
}));

const PLAYLIST = { _id: "pl1", title: "My Playlist" };
const BEAT = {
  _id: "b1",
  title: "Old Title",
  artist: "Artist X",
  description: "desc",
  audioFile: "https://example.com/a.mp3",
};

const renderAdminBeats = () =>
  render(
    <MemoryRouter initialEntries={["/admin/playlists/pl1/beats"]}>
      <ToastProvider>
        <ConfirmProvider>
          <Routes>
            <Route path="/admin/playlists/:id/beats" element={<AdminBeats />} />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </MemoryRouter>
  );

describe("AdminBeats (representative admin CRUD flow)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    adminService.playlists.list.mockResolvedValue({ data: [PLAYLIST] });
    adminService.beats.list.mockResolvedValue({ data: [BEAT] });
  });

  it("fetches the playlist and beats exactly once on mount (no infinite refetch loop)", async () => {
    renderAdminBeats();

    expect(await screen.findByText("Old Title")).toBeInTheDocument();
    // give any runaway effect loop a chance to fire before asserting call counts
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(adminService.playlists.list).toHaveBeenCalledTimes(1);
    expect(adminService.beats.list).toHaveBeenCalledTimes(1);
  });

  it("edits a beat: pre-fills the form, submits, calls adminService.beats.update, and shows a success toast", async () => {
    const user = userEvent.setup();
    adminService.beats.update.mockResolvedValue({});

    renderAdminBeats();

    expect(await screen.findByText("Old Title")).toBeInTheDocument();

    await user.click(screen.getByText("Editar"));
    expect(screen.getByText("Editar Beat")).toBeInTheDocument();

    const titleInput = screen.getByDisplayValue("Old Title");
    await user.clear(titleInput);
    await user.type(titleInput, "New Title");

    await user.click(screen.getByText("Actualizar"));

    await waitFor(() =>
      expect(adminService.beats.update).toHaveBeenCalledWith(
        "b1",
        expect.objectContaining({ title: "New Title", artist: "Artist X", audioFile: BEAT.audioFile })
      )
    );
    expect(await screen.findByText(/Beat actualizado/)).toBeInTheDocument();
  });

  it("deletes a beat after confirmation and shows a success toast", async () => {
    const user = userEvent.setup();
    adminService.beats.delete.mockResolvedValue({});

    renderAdminBeats();

    expect(await screen.findByText("Old Title")).toBeInTheDocument();
    await user.click(screen.getByText("Eliminar"));

    const confirmButtons = screen.getAllByText("Eliminar");
    await user.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => expect(adminService.beats.delete).toHaveBeenCalledWith("b1"));
    expect(await screen.findByText(/Beat eliminado/)).toBeInTheDocument();
  });
});
