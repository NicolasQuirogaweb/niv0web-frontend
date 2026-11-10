import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import "../../i18n/config";
import { AdminPlaylists } from "./AdminPlaylists";
import { AdminSamplePacks } from "./AdminSamplePacks";
import { ToastProvider } from "../../hooks/useToast";
import { ConfirmProvider } from "../../hooks/useConfirm";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: {
    playlists: { list: vi.fn(), delete: vi.fn(), duplicate: vi.fn() },
    samplepacks: { list: vi.fn(), delete: vi.fn(), duplicate: vi.fn() },
  },
}));

const hold = () => {
  let finish;
  const promise = new Promise((resolve) => { finish = resolve; });
  return { promise, finish: () => finish({}) };
};

const renderWith = (ui) =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <ConfirmProvider>{ui}</ConfirmProvider>
      </ToastProvider>
    </MemoryRouter>
  );

describe("Admin catalog lists: no double submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.playlists.list.mockResolvedValue({ data: [{ _id: "pl1", title: "Trap", description: "d", type: "beats", itemsCount: 2 }] });
    adminService.samplepacks.list.mockResolvedValue({ data: [{ _id: "p1", title: "Drums", description: "d", priceArs: null, itemsCount: 3 }] });
  });

  it("disables Duplicate while a catalog is being duplicated", async () => {
    const pending = hold();
    adminService.playlists.duplicate.mockReturnValue(pending.promise);
    renderWith(<AdminPlaylists type="beats" />);
    const duplicate = await screen.findByRole("button", { name: /copiar/i });

    await userEvent.click(duplicate);
    expect(duplicate).toBeDisabled();
    await userEvent.click(duplicate);
    expect(adminService.playlists.duplicate).toHaveBeenCalledTimes(1);

    pending.finish();
    // The list reloads after the request, so query the button again.
    await waitFor(() => expect(screen.getByRole("button", { name: /copiar/i })).not.toBeDisabled());
  });

  it("disables Delete while a catalog is being deleted", async () => {
    const pending = hold();
    adminService.playlists.delete.mockReturnValue(pending.promise);
    renderWith(<AdminPlaylists type="beats" />);
    const del = await screen.findByRole("button", { name: /eliminar/i });

    await userEvent.click(del);
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(del).toBeDisabled());

    pending.finish();
    await waitFor(() => expect(adminService.playlists.list).toHaveBeenCalledTimes(2));
  });

  it("disables a sample pack's Duplicate and Delete while their requests run", async () => {
    const dup = hold();
    adminService.samplepacks.duplicate.mockReturnValue(dup.promise);
    renderWith(<AdminSamplePacks />);
    const duplicate = await screen.findByRole("button", { name: /copiar/i });
    await userEvent.click(duplicate);
    expect(duplicate).toBeDisabled();
    dup.finish();
    // The list reloads after the request, so query the button again.
    await waitFor(() => expect(screen.getByRole("button", { name: /copiar/i })).not.toBeDisabled());

    const del = hold();
    adminService.samplepacks.delete.mockReturnValue(del.promise);
    const remove = screen.getByRole("button", { name: /eliminar/i });
    await userEvent.click(remove);
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(remove).toBeDisabled());
    del.finish();
  });
});
