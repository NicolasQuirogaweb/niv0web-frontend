import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../i18n/config";
import { ConfirmProvider, useConfirm } from "./useConfirm";

const Opener = ({ options, onResult = () => {} }) => {
  const confirm = useConfirm();
  return (
    <>
      <button onClick={async () => onResult(await confirm("¿Seguro?", "Mensaje", options))}>abrir</button>
      <button>otro</button>
    </>
  );
};

const renderConfirm = (props) =>
  render(
    <ConfirmProvider>
      <Opener {...props} />
    </ConfirmProvider>
  );

describe("useConfirm", () => {
  it("uses the delete label by default", async () => {
    renderConfirm();
    await userEvent.click(screen.getByText("abrir"));
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByRole("button", { name: "Eliminar" })).toBeInTheDocument();
  });

  it("accepts a custom confirm label and a neutral tone", async () => {
    const onResult = vi.fn();
    renderConfirm({ options: { confirmLabel: "Cambiar rol", tone: "neutral" }, onResult });
    await userEvent.click(screen.getByText("abrir"));
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
    const ok = within(dialog).getByRole("button", { name: "Cambiar rol" });
    expect(ok).toHaveAttribute("data-tone", "neutral");
    await userEvent.click(ok);
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
  });

  it("gives the dialog a heading", async () => {
    renderConfirm();
    await userEvent.click(screen.getByText("abrir"));
    expect(within(screen.getByRole("alertdialog")).getByRole("heading", { name: "¿Seguro?" })).toBeInTheDocument();
  });

  it("returns focus to the button that opened it", async () => {
    renderConfirm();
    const opener = screen.getByText("abrir");
    await userEvent.click(opener);
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  it("keeps Tab inside the dialog", async () => {
    renderConfirm();
    await userEvent.click(screen.getByText("abrir"));
    const dialog = screen.getByRole("alertdialog");
    const cancel = within(dialog).getByRole("button", { name: "Cancelar" });
    const ok = within(dialog).getByRole("button", { name: "Eliminar" });

    await userEvent.tab();
    expect(ok).toHaveFocus();
    await userEvent.tab();
    expect(cancel).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(ok).toHaveFocus();
  });
});
