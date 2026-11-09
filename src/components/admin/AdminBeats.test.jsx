import { render, screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../../i18n/config";
import { AdminBeats } from "./AdminBeats";
import { ToastProvider } from "../../hooks/useToast";
import { ConfirmProvider } from "../../hooks/useConfirm";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: {
    playlists: { list: vi.fn() },
    beats: {
      list: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      batch: vi.fn(),
    },
    upload: { file: vi.fn(), batch: vi.fn() },
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
    vi.clearAllMocks();
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

describe("AdminBeats keyboard and form accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.playlists.list.mockResolvedValue({ data: [PLAYLIST] });
    adminService.beats.list.mockResolvedValue({ data: [BEAT] });
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("makes the batch drop zone a label for a focusable file input", async () => {
    renderAdminBeats();
    await screen.findByText("Old Title");
    await userEvent.click(screen.getByRole("button", { name: /subir beats en lote/i }));

    const input = screen.getByLabelText(/arrastrá archivos/i);
    expect(input).toHaveAttribute("type", "file");
    expect(input.closest("label")).not.toBeNull();
    expect(input.style.display).not.toBe("none");
  });

  it("scrolls the form into view and focuses the title when editing a row", async () => {
    renderAdminBeats();
    await screen.findByText("Old Title");
    await userEvent.click(screen.getByText("Editar"));

    const title = screen.getByLabelText("Título");
    expect(title).toHaveValue("Old Title");
    await waitFor(() => expect(title).toHaveFocus());
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("names every field and ties the audio label to the uploader", async () => {
    renderAdminBeats();
    await screen.findByText("Old Title");
    await userEvent.click(screen.getByRole("button", { name: /nuevo beat/i }));

    expect(screen.getByLabelText("Título")).toHaveAttribute("name", "title");
    expect(screen.getByLabelText("Artista")).toHaveAttribute("name", "artist");
    expect(screen.getByLabelText("Descripción")).toHaveAttribute("name", "description");
    expect(screen.getByLabelText(/archivo de audio/i)).toHaveAttribute("type", "file");
  });

  it("links errors to their fields and focuses the first invalid one on submit", async () => {
    renderAdminBeats();
    await screen.findByText("Old Title");
    await userEvent.click(screen.getByRole("button", { name: /nuevo beat/i }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));

    const title = screen.getByLabelText("Título");
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAccessibleDescription("El título es obligatorio");
    expect(title).toHaveFocus();
    expect(screen.getByLabelText(/archivo de audio/i)).toHaveAccessibleDescription("El archivo de audio es obligatorio");
    expect(adminService.beats.create).not.toHaveBeenCalled();
  });

  it("closes an untouched form on Cancel without asking", async () => {
    renderAdminBeats();
    await screen.findByText("Old Title");
    await userEvent.click(screen.getByText("Editar"));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Editar Beat")).not.toBeInTheDocument();
  });

  it("asks before discarding edits on Cancel and guards the tab while dirty", async () => {
    renderAdminBeats();
    await screen.findByText("Old Title");
    await userEvent.click(screen.getByText("Editar"));
    await userEvent.type(screen.getByLabelText("Título"), " v2");

    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    const dialog = screen.getByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));
    expect(screen.getByLabelText("Título")).toHaveValue("Old Title v2");

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Descartar" }));
    await waitFor(() => expect(screen.queryByText("Editar Beat")).not.toBeInTheDocument());
  });

  it("disables a row's Delete while the request runs", async () => {
    let finish;
    adminService.beats.delete.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    renderAdminBeats();
    await screen.findByText("Old Title");
    const rowDelete = screen.getByRole("button", { name: "Eliminar" });
    await userEvent.click(rowDelete);
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(rowDelete).toBeDisabled());
    await act(async () => finish({}));
    await waitFor(() => expect(adminService.beats.list).toHaveBeenCalledTimes(2));
  });
});
