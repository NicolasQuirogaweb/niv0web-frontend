import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../i18n/config";
import { ConfirmProvider } from "./useConfirm";
import { useUnsavedChanges } from "./useUnsavedChanges";

const Form = ({ dirty, onLeave }) => {
  const confirmDiscard = useUnsavedChanges(dirty);
  return <button onClick={async () => (await confirmDiscard()) && onLeave()}>cancelar</button>;
};

const renderForm = (dirty, onLeave = vi.fn()) =>
  render(
    <ConfirmProvider>
      <Form dirty={dirty} onLeave={onLeave} />
    </ConfirmProvider>
  );

const fireBeforeUnload = () => {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
};

describe("useUnsavedChanges", () => {
  it("does not block the tab or ask when nothing changed", async () => {
    const onLeave = vi.fn();
    renderForm(false, onLeave);
    expect(fireBeforeUnload().defaultPrevented).toBe(false);
    await userEvent.click(screen.getByText("cancelar"));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(onLeave).toHaveBeenCalled();
  });

  it("warns before closing the tab while dirty", () => {
    renderForm(true);
    expect(fireBeforeUnload().defaultPrevented).toBe(true);
  });

  it("stops warning once the form is clean again", () => {
    const { rerender } = renderForm(true);
    rerender(
      <ConfirmProvider>
        <Form dirty={false} onLeave={vi.fn()} />
      </ConfirmProvider>
    );
    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });

  it("asks before discarding and stays when the user cancels", async () => {
    const onLeave = vi.fn();
    renderForm(true, onLeave);
    await userEvent.click(screen.getByText("cancelar"));
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("¿Descartar los cambios?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));
    expect(onLeave).not.toHaveBeenCalled();
  });

  it("discards when confirmed", async () => {
    const onLeave = vi.fn();
    renderForm(true, onLeave);
    await userEvent.click(screen.getByText("cancelar"));
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Descartar" }));
    await waitFor(() => expect(onLeave).toHaveBeenCalled());
  });
});
