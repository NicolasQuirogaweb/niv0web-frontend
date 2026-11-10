import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../i18n/config";
import { AdminUsers } from "./AdminUsers";
import { AuthContext } from "../../context/AuthContext";
import { ToastProvider } from "../../hooks/useToast";
import { ConfirmProvider } from "../../hooks/useConfirm";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: { users: { list: vi.fn(), updateRole: vi.fn() } },
}));

const ME = { _id: "u1", name: "Nico", email: "me@niv0.com", role: "admin" };
const OTHER = { _id: "u2", name: "Ana", email: "ana@mail.com", role: "user" };

const renderUsers = () =>
  render(
    <AuthContext.Provider value={{ userEmail: ME.email, userRole: "admin", isAuthenticated: true }}>
      <ToastProvider>
        <ConfirmProvider>
          <AdminUsers />
        </ConfirmProvider>
      </ToastProvider>
    </AuthContext.Provider>
  );

const row = async (name) => (await screen.findByText(name)).closest("div").parentElement;

describe("AdminUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.users.list.mockResolvedValue({ data: [ME, OTHER] });
  });

  it("shows roles translated", async () => {
    renderUsers();
    expect(within(await row("Ana")).getByText("usuario")).toBeInTheDocument();
  });

  it("asks with a neutral 'Cambiar rol' button instead of a red 'Eliminar'", async () => {
    adminService.users.updateRole.mockResolvedValue({});
    renderUsers();
    await userEvent.click(within(await row("Ana")).getByRole("button", { name: /hacer admin/i }));

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
    const ok = within(dialog).getByRole("button", { name: "Cambiar rol" });
    expect(ok).toHaveAttribute("data-tone", "neutral");
    await userEvent.click(ok);
    await waitFor(() => expect(adminService.users.updateRole).toHaveBeenCalledWith("u2", "admin"));
  });

  it("does not let an admin remove their own admin role", async () => {
    renderUsers();
    const button = within(await row("Nico")).getByRole("button", { name: /revocar admin/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription("No podés quitarte tu propio rol de admin");
  });

  it("disables the role button while the change is saved", async () => {
    let finish;
    adminService.users.updateRole.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    renderUsers();
    const button = within(await row("Ana")).getByRole("button", { name: /hacer admin/i });
    await userEvent.click(button);
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Cambiar rol" }));
    await waitFor(() => expect(button).toBeDisabled());
    finish({});
    await waitFor(() => expect(adminService.users.list).toHaveBeenCalledTimes(2));
  });
});
