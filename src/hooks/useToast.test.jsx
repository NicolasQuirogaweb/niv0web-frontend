import { render, screen, act, fireEvent } from "@testing-library/react";
import "../i18n/config";
import { ToastProvider, useToast } from "./useToast";

const Trigger = () => {
  const toast = useToast();
  return (
    <>
      <button onClick={() => toast.success("Guardado")}>ok</button>
      <button onClick={() => toast.error("Falló la subida")}>fail</button>
    </>
  );
};

const renderToasts = () =>
  render(
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  );

describe("ToastProvider", () => {
  afterEach(() => vi.useRealTimers());

  it("announces success toasts politely and errors as alerts", () => {
    renderToasts();
    fireEvent.click(screen.getByText("ok"));
    fireEvent.click(screen.getByText("fail"));

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Guardado");
    expect(screen.getByRole("alert")).toHaveTextContent("Falló la subida");
  });

  it("closes a toast with its labelled close button", () => {
    renderToasts();
    fireEvent.click(screen.getByText("ok"));
    fireEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));
    expect(screen.queryByText("Guardado")).not.toBeInTheDocument();
  });

  it("auto-dismisses success toasts, but not while hovered", () => {
    vi.useFakeTimers();
    renderToasts();
    fireEvent.click(screen.getByText("ok"));
    const toast = screen.getByText("Guardado").closest("[data-toast]");

    fireEvent.mouseEnter(toast);
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByText("Guardado")).toBeInTheDocument();

    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByText("Guardado")).not.toBeInTheDocument();
  });

  it("pauses while the toast has keyboard focus", () => {
    vi.useFakeTimers();
    renderToasts();
    fireEvent.click(screen.getByText("ok"));
    fireEvent.focus(screen.getByRole("button", { name: "Cerrar aviso" }));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByText("Guardado")).toBeInTheDocument();
  });

  it("keeps error toasts until they are dismissed", () => {
    vi.useFakeTimers();
    renderToasts();
    fireEvent.click(screen.getByText("fail"));
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByText("Falló la subida")).toBeInTheDocument();
  });
});
