import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../../i18n/config";
import { AdminSamples } from "./AdminSamples";
import { ToastProvider } from "../../hooks/useToast";
import { ConfirmProvider } from "../../hooks/useConfirm";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: {
    samplepacks: { list: vi.fn(), deleteFolder: vi.fn(), addFolder: vi.fn(), renameFolder: vi.fn(), reorderFolders: vi.fn(), buildZip: vi.fn() },
    samples: { list: vi.fn(), update: vi.fn(), create: vi.fn(), batch: vi.fn(), delete: vi.fn() },
    upload: { batch: vi.fn() },
  },
}));

const packWith = (folders) => ({ _id: "p1", title: "Mastermind", folders, zip: { build: { status: "idle" } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/admin/samplepacks/p1/samples"]}>
      <ToastProvider>
        <ConfirmProvider>
          <Routes>
            <Route path="/admin/samplepacks/:id/samples" element={<AdminSamples />} />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </MemoryRouter>
  );

// Folder delete goes through the confirm dialog.
const deleteFolder = async (index) => {
  await userEvent.click(screen.getAllByRole("button", { name: /^eliminar$/i })[index]);
  await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: /^eliminar$/i }));
};

describe("AdminSamples folder selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.samples.list.mockResolvedValue({ data: [] });
    adminService.samplepacks.deleteFolder.mockResolvedValue({ data: {} });
  });

  it("drops a deleted folder from the batch and form selects and re-preselects the only one left", async () => {
    adminService.samplepacks.list
      .mockResolvedValueOnce({ data: [packWith(["Kicks", "Snares"])] })
      .mockResolvedValue({ data: [packWith(["Kicks"])] });
    renderPage();
    await screen.findAllByRole("button", { name: /^eliminar$/i });

    await userEvent.click(screen.getByRole("button", { name: /subir samples en lote/i }));
    const batch = screen.getByLabelText(/carpeta de destino/i);
    await userEvent.selectOptions(batch, "Snares");
    expect(batch).toHaveValue("Snares");

    await deleteFolder(1);
    await waitFor(() => expect(screen.getByLabelText(/carpeta de destino/i)).toHaveValue("Kicks"));
  });

  it("clears the stale batch folder when several folders remain and blocks nothing from reaching B2", async () => {
    adminService.samplepacks.list
      .mockResolvedValueOnce({ data: [packWith(["A", "B", "C"])] })
      .mockResolvedValue({ data: [packWith(["A", "C"])] });
    renderPage();
    await screen.findAllByRole("button", { name: /^eliminar$/i });
    await userEvent.click(screen.getByRole("button", { name: /subir samples en lote/i }));
    await userEvent.selectOptions(screen.getByLabelText(/carpeta de destino/i), "B");

    await deleteFolder(1);
    await waitFor(() => expect(screen.getByLabelText(/carpeta de destino/i)).toHaveValue(""));
    expect(adminService.upload.batch).not.toHaveBeenCalled();
  });
});

describe("AdminSamples keyboard, confirm and unsaved changes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.samples.list.mockResolvedValue({ data: [] });
    adminService.samplepacks.deleteFolder.mockResolvedValue({ data: {} });
    adminService.samplepacks.list.mockResolvedValue({ data: [packWith(["Kicks", "Snares"])] });
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("makes the batch drop zone a label for a focusable file input", async () => {
    renderPage();
    await screen.findAllByRole("button", { name: /^eliminar$/i });
    await userEvent.click(screen.getByRole("button", { name: /subir samples en lote/i }));

    const input = screen.getByLabelText(/arrastrá archivos/i);
    expect(input).toHaveAttribute("type", "file");
    expect(input.closest("label")).not.toBeNull();
    expect(input.style.display).not.toBe("none");
  });

  it("asks before deleting a folder and keeps it when cancelled", async () => {
    renderPage();
    await screen.findAllByRole("button", { name: /^eliminar$/i });
    await userEvent.click(screen.getAllByRole("button", { name: /^eliminar$/i })[0]);

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText(/eliminar la carpeta kicks/i)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: /cancelar/i }));
    expect(adminService.samplepacks.deleteFolder).not.toHaveBeenCalled();

    await deleteFolder(0);
    await waitFor(() => expect(adminService.samplepacks.deleteFolder).toHaveBeenCalledWith("p1", "Kicks"));
  });

  it("does not treat the preselected only folder as an unsaved change", async () => {
    adminService.samplepacks.list.mockResolvedValue({ data: [packWith(["Kicks"])] });
    renderPage();
    await screen.findAllByRole("button", { name: /^eliminar$/i });
    await userEvent.click(screen.getByRole("button", { name: /nuevo sample/i }));
    await waitFor(() => expect(screen.getByLabelText("Carpeta")).toHaveValue("Kicks"));

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Título")).not.toBeInTheDocument();
  });

  it("links the folder error to the select and focuses the first invalid field", async () => {
    renderPage();
    await screen.findAllByRole("button", { name: /^eliminar$/i });
    await userEvent.click(screen.getByRole("button", { name: /nuevo sample/i }));
    await userEvent.type(screen.getByLabelText("Título"), "Kick 01");
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));

    const folder = screen.getByLabelText("Carpeta");
    expect(folder).toHaveAttribute("aria-invalid", "true");
    expect(folder).toHaveAccessibleDescription("Elegí una carpeta");
    expect(folder).toHaveFocus();
  });
});
