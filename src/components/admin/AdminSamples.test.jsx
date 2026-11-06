import { render, screen, waitFor } from "@testing-library/react";
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

    await userEvent.click(screen.getAllByRole("button", { name: /^eliminar$/i })[1]);
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

    await userEvent.click(screen.getAllByRole("button", { name: /^eliminar$/i })[1]);
    await waitFor(() => expect(screen.getByLabelText(/carpeta de destino/i)).toHaveValue(""));
    expect(adminService.upload.batch).not.toHaveBeenCalled();
  });
});
