import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../../i18n/config";
import { AdminPlaylistForm } from "./AdminPlaylistForm";
import { ToastProvider } from "../../hooks/useToast";
import { ConfirmProvider } from "../../hooks/useConfirm";
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
        <ConfirmProvider>
        <Routes>
          <Route path={routePath} element={<AdminPlaylistForm type={type} />} />
        </Routes>
        </ConfirmProvider>
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

const renderWithList = (path = "/admin/playlists/new") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <ConfirmProvider>
          <Routes>
            <Route path="/admin/playlists/new" element={<AdminPlaylistForm type="beats" />} />
            <Route path="/admin/playlists/:id/edit" element={<AdminPlaylistForm type="beats" />} />
            <Route path="/admin/playlists" element={<p>LISTA</p>} />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </MemoryRouter>
  );

describe("AdminPlaylistForm accessibility and unsaved changes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.playlists.list.mockResolvedValue({
      data: [{ _id: "pl1", title: "Summer 2k25", description: "desc", imageUrl: "a", backgroundVideo: "b", type: "beats" }],
    });
  });

  it("ties the cover and background labels to their uploaders", () => {
    renderWithList();
    expect(screen.getByLabelText(/imagen de portada/i)).toHaveAttribute("type", "file");
    expect(screen.getByLabelText(/fondo \(video o imagen\)/i)).toHaveAttribute("type", "file");
  });

  it("links each error to its field and focuses the first invalid one", async () => {
    renderWithList();
    await userEvent.click(screen.getByRole("button", { name: /crear catálogo/i }));

    const title = screen.getByLabelText(/título/i);
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAccessibleDescription("El título es obligatorio");
    expect(title).toHaveFocus();
    expect(screen.getByLabelText(/imagen de portada/i)).toHaveAccessibleDescription("La imagen de portada es obligatoria");
    expect(adminService.playlists.create).not.toHaveBeenCalled();
  });

  it("leaves without asking when nothing changed after loading", async () => {
    renderWithList("/admin/playlists/pl1/edit");
    await screen.findByDisplayValue("Summer 2k25");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(await screen.findByText("LISTA")).toBeInTheDocument();
  });

  it("asks before discarding edits and guards the tab while dirty", async () => {
    renderWithList();
    await userEvent.type(screen.getByLabelText(/título/i), "Nuevo");

    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByText("LISTA")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Descartar" }));
    expect(await screen.findByText("LISTA")).toBeInTheDocument();
  });
});
