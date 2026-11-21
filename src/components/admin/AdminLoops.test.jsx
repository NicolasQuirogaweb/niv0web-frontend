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
    loops: { list: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn(), batch: vi.fn() },
    upload: { file: vi.fn(), files: vi.fn() },
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

  it("fills title and description with the audio's name when a file is uploaded, and both stay editable", async () => {
    adminService.upload.file.mockResolvedValue({ data: { url: "https://b2/loops/x.wav" } });
    renderPage();
    await screen.findByText("Loop Uno");
    await userEvent.click(screen.getByRole("button", { name: /nuevo loop/i }));
    const file = new File(["a"], "Dark Keys 140bpm.wav", { type: "audio/wav" });
    await userEvent.upload(document.getElementById("loop-audioFile"), file);

    await waitFor(() => expect(screen.getByLabelText("Título")).toHaveValue("Dark Keys 140bpm"));
    expect(screen.getByLabelText("Descripción")).toHaveValue("Dark Keys 140bpm");
    await userEvent.type(screen.getByLabelText("Título"), " v2");
    expect(screen.getByLabelText("Título")).toHaveValue("Dark Keys 140bpm v2");
  });

  it("uploads many loops at once, each named after its file in title and description", async () => {
    adminService.upload.files.mockResolvedValue({
      results: [
        { success: true, url: "https://b2/loops/a.wav", originalName: "Loop A.wav" },
        { success: true, url: "https://b2/loops/b.mp3", originalName: "Loop B.mp3" },
      ],
    });
    adminService.loops.batch.mockResolvedValue({ data: { count: 2 } });
    renderPage();
    await screen.findByText("Loop Uno");
    await userEvent.click(screen.getByRole("button", { name: /subir loops en lote/i }));
    const files = [new File(["a"], "Loop A.wav", { type: "audio/wav" }), new File(["b"], "Loop B.mp3", { type: "audio/mpeg" })];
    await userEvent.upload(document.getElementById("batch-input-loops"), files);
    await userEvent.click(screen.getByRole("button", { name: /subir 2/i }));

    await waitFor(() => expect(adminService.loops.batch).toHaveBeenCalledWith("pl1", [
      { title: "Loop A", description: "Loop A", audioFile: "https://b2/loops/a.wav" },
      { title: "Loop B", description: "Loop B", audioFile: "https://b2/loops/b.mp3" },
    ]));
  });
});
