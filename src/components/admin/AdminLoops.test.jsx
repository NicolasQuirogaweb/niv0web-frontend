import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../../i18n/config";
import { AdminLoops } from "./AdminLoops";
import { ToastProvider } from "../../hooks/useToast";
import { ConfirmProvider } from "../../hooks/useConfirm";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: {
    playlists: { list: vi.fn() },
    loops: { list: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn() },
    upload: { file: vi.fn() },
  },
}));

const LOOP = { _id: "l1", title: "Loop Uno", description: "desc", audioFile: "https://b2/l.wav" };

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/admin/loops/pl1/loops"]}>
      <ToastProvider>
        <ConfirmProvider>
          <Routes>
            <Route path="/admin/loops/:id/loops" element={<AdminLoops />} />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </MemoryRouter>
  );

describe("AdminLoops", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.playlists.list.mockResolvedValue({ data: [{ _id: "pl1", title: "Loops 1" }] });
    adminService.loops.list.mockResolvedValue({ data: [LOOP] });
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("brings the form into view and focuses the title when editing", async () => {
    renderPage();
    await screen.findByText("Loop Uno");
    await userEvent.click(screen.getByRole("button", { name: /editar/i }));

    await waitFor(() => expect(screen.getByLabelText("Título")).toHaveFocus());
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(screen.getByLabelText("Descripción")).toHaveValue("desc");
  });

  it("marks the empty title as invalid and focuses it", async () => {
    renderPage();
    await screen.findByText("Loop Uno");
    await userEvent.click(screen.getByRole("button", { name: /editar/i }));
    await userEvent.clear(screen.getByLabelText("Título"));
    await userEvent.click(screen.getByRole("button", { name: "Actualizar" }));

    const title = screen.getByLabelText("Título");
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAccessibleDescription("El título es obligatorio");
    expect(title).toHaveFocus();
  });
});
