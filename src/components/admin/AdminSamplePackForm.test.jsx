import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../../i18n/config";
import { AdminSamplePackForm } from "./AdminSamplePackForm";
import { ToastProvider } from "../../hooks/useToast";
import { ConfirmProvider } from "../../hooks/useConfirm";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: {
    samplepacks: { list: vi.fn(), update: vi.fn(), create: vi.fn() },
    upload: { file: vi.fn() },
  },
}));

const pack = { _id: "p1", title: "Mastermind", description: "Drums", imageUrl: "", priceArs: null, priceUsd: null, published: false };

const renderEdit = () =>
  render(
    <MemoryRouter initialEntries={["/admin/samplepacks/p1/edit"]}>
      <ToastProvider>
        <ConfirmProvider>
        <Routes>
          <Route path="/admin/samplepacks/:id/edit" element={<AdminSamplePackForm />} />
        </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </MemoryRouter>
  );

describe("AdminSamplePackForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.samplepacks.list.mockResolvedValue({ data: [pack] });
  });

  it("loads the pack and shows it as free", async () => {
    renderEdit();
    expect(await screen.findByDisplayValue("Mastermind")).toBeInTheDocument();
    expect(screen.getByLabelText(/gratis/i)).toBeChecked();
  });

  it("asks for the ARS price when the pack is not free and does not save", async () => {
    renderEdit();
    await screen.findByDisplayValue("Mastermind");
    await userEvent.click(screen.getByLabelText(/gratis/i));
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));
    expect(await screen.findByText(/ingresá el precio en ars/i)).toBeInTheDocument();
    expect(adminService.samplepacks.update).not.toHaveBeenCalled();
  });

  it("sends null prices when free", async () => {
    adminService.samplepacks.update.mockResolvedValue({ data: pack });
    renderEdit();
    await screen.findByDisplayValue("Mastermind");
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));
    await waitFor(() => expect(adminService.samplepacks.update).toHaveBeenCalled());
    expect(adminService.samplepacks.update.mock.calls[0][1]).toMatchObject({ priceArs: null, priceUsd: null, published: false });
  });

  it("sends imageUrl null when the pack has no cover", async () => {
    adminService.samplepacks.update.mockResolvedValue({ data: pack });
    renderEdit();
    await screen.findByDisplayValue("Mastermind");
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));
    await waitFor(() => expect(adminService.samplepacks.update).toHaveBeenCalled());
    expect(adminService.samplepacks.update.mock.calls[0][1].imageUrl).toBeNull();
  });

  it("keeps the cover url when the pack has one", async () => {
    adminService.samplepacks.list.mockResolvedValue({ data: [{ ...pack, imageUrl: "https://b2/cover.jpg" }] });
    adminService.samplepacks.update.mockResolvedValue({ data: pack });
    renderEdit();
    await screen.findByDisplayValue("Mastermind");
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));
    await waitFor(() => expect(adminService.samplepacks.update).toHaveBeenCalled());
    expect(adminService.samplepacks.update.mock.calls[0][1].imageUrl).toBe("https://b2/cover.jpg");
  });

  it("loads and sends the English description", async () => {
    adminService.samplepacks.list.mockResolvedValue({ data: [{ ...pack, descriptionEn: "Drums, in English" }] });
    adminService.samplepacks.update.mockResolvedValue({ data: pack });
    renderEdit();
    const field = await screen.findByLabelText("Descripción (inglés)");
    expect(field).toHaveValue("Drums, in English");
    await userEvent.clear(field);
    await userEvent.type(field, "Free drums");
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));
    await waitFor(() => expect(adminService.samplepacks.update).toHaveBeenCalled());
    expect(adminService.samplepacks.update.mock.calls[0][1].descriptionEn).toBe("Free drums");
  });

  it("sends an empty English description when there is none", async () => {
    adminService.samplepacks.update.mockResolvedValue({ data: pack });
    renderEdit();
    await screen.findByDisplayValue("Mastermind");
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));
    await waitFor(() => expect(adminService.samplepacks.update).toHaveBeenCalled());
    expect(adminService.samplepacks.update.mock.calls[0][1].descriptionEn).toBe("");
  });

  it("limits the English description to 300 characters", async () => {
    renderEdit();
    const field = await screen.findByLabelText("Descripción (inglés)");
    await userEvent.click(field);
    await userEvent.paste("x".repeat(301));
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));
    expect(await screen.findByText("Máximo 300 caracteres")).toBeInTheDocument();
    expect(adminService.samplepacks.update).not.toHaveBeenCalled();
  });

  it("shows the Spanish message for PACK_PAID_NOT_SELLABLE", async () => {
    adminService.samplepacks.update.mockRejectedValue({
      response: { status: 409, data: { code: "PACK_PAID_NOT_SELLABLE", message: "x" } },
    });
    renderEdit();
    await screen.findByDisplayValue("Mastermind");
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));
    expect(await screen.findByText(/se publican cuando esté la tienda/i)).toBeInTheDocument();
  });
});

describe("AdminSamplePackForm accessibility and unsaved changes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.samplepacks.list.mockResolvedValue({ data: [pack] });
  });

  const renderWithList = () =>
    render(
      <MemoryRouter initialEntries={["/admin/samplepacks/p1/edit"]}>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              <Route path="/admin/samplepacks/:id/edit" element={<AdminSamplePackForm />} />
              <Route path="/admin/samplepacks" element={<p>LISTA</p>} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </MemoryRouter>
    );

  it("ties the cover label to its uploader", async () => {
    renderWithList();
    await screen.findByDisplayValue("Mastermind");
    expect(screen.getByLabelText(/portada \(opcional\)/i)).toHaveAttribute("type", "file");
  });

  it("marks the missing ARS price invalid, describes it and focuses it", async () => {
    renderWithList();
    await screen.findByDisplayValue("Mastermind");
    await userEvent.click(screen.getByLabelText(/gratis/i));
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));

    const price = screen.getByLabelText(/precio en ars/i);
    expect(price).toHaveAttribute("aria-invalid", "true");
    expect(price).toHaveAccessibleDescription(/ingresá el precio en ars/i);
    expect(price).toHaveFocus();
  });

  it("keeps the English description hint and adds its error", async () => {
    renderWithList();
    const field = await screen.findByLabelText("Descripción (inglés)");
    await userEvent.click(field);
    await userEvent.paste("x".repeat(301));
    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));

    expect(field).toHaveAccessibleDescription(/opcional\. .*máximo 300 caracteres/i);
    expect(field).toHaveFocus();
  });

  it("leaves without asking when nothing changed after loading", async () => {
    renderWithList();
    await screen.findByDisplayValue("Mastermind");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(await screen.findByText("LISTA")).toBeInTheDocument();
  });

  it("asks before discarding a changed price", async () => {
    renderWithList();
    await screen.findByDisplayValue("Mastermind");
    await userEvent.click(screen.getByLabelText(/gratis/i));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("¿Descartar los cambios?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Descartar" }));
    expect(await screen.findByText("LISTA")).toBeInTheDocument();
  });
});
