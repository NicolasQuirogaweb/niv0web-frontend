import { render, screen, fireEvent } from "@testing-library/react";
import i18n from "../../i18n/config";
import { ThemePicker } from "./ThemePicker";
import { accentRgb, loadAccentHue, ACCENT_PRESETS } from "../../utils/theme";

const trigger = () => screen.getByRole("button", { name: i18n.t("theme.open") });
const open = () => {
  fireEvent.click(trigger());
  return screen.getByRole("dialog", { name: i18n.t("theme.title") });
};
const accent = () => document.documentElement.style.getPropertyValue("--color-accent-rgb");

describe("ThemePicker", () => {
  beforeEach(() => {
    i18n.changeLanguage("es");
    localStorage.clear();
    document.documentElement.removeAttribute("style");
  });

  it("is a closed button until you open it", () => {
    render(<ThemePicker />);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    open();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("offers the six colors by name, amber chosen at first", () => {
    render(<ThemePicker />);
    open();
    ACCENT_PRESETS.forEach(({ id }) => {
      const swatch = screen.getByRole("button", { name: i18n.t(`theme.presets.${id}`) });
      expect(swatch).toHaveAttribute("aria-pressed", id === "amber" ? "true" : "false");
    });
  });

  it("picking a color repaints the site and remembers it", () => {
    render(<ThemePicker />);
    open();
    fireEvent.click(screen.getByRole("button", { name: i18n.t("theme.presets.cyan") }));
    const cyan = ACCENT_PRESETS.find((p) => p.id === "cyan").hue;
    expect(accent()).toBe(accentRgb(cyan).join(" "));
    expect(loadAccentHue()).toBe(cyan);
    expect(screen.getByRole("button", { name: i18n.t("theme.presets.cyan") })).toHaveAttribute("aria-pressed", "true");
  });

  it("the fader picks any hue and the readout shows it in degrees", () => {
    render(<ThemePicker />);
    open();
    fireEvent.change(screen.getByRole("slider", { name: i18n.t("theme.hue") }), { target: { value: "120" } });
    expect(accent()).toBe(accentRgb(120).join(" "));
    expect(loadAccentHue()).toBe(120);
    expect(screen.getByText("120°")).toBeInTheDocument();
  });

  it("Esc closes it, gives focus back to the button and does not leave the page", () => {
    const pageSaw = vi.fn();
    const onWindowKey = (e) => pageSaw(e.defaultPrevented);
    window.addEventListener("keydown", onWindowKey);
    render(<ThemePicker />);
    const dialog = open();
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    expect(pageSaw).toHaveBeenCalledWith(true);
    window.removeEventListener("keydown", onWindowKey);
  });

  it("Esc closes it right after clicking the button too, without leaving the page", () => {
    const pageSaw = vi.fn();
    const onWindowKey = (e) => pageSaw(e.defaultPrevented);
    window.addEventListener("keydown", onWindowKey);
    render(<ThemePicker />);
    open();
    trigger().focus();
    fireEvent.keyDown(trigger(), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(pageSaw).toHaveBeenCalledWith(true);
    window.removeEventListener("keydown", onWindowKey);
  });

  it("the window's labels are translated", () => {
    i18n.changeLanguage("es");
    render(<ThemePicker />);
    open();
    expect(screen.getByText(i18n.t("theme.accent"))).toBeInTheDocument();
    expect(i18n.exists("theme.button", { lng: "en" }) && i18n.exists("theme.bar", { lng: "en" })).toBe(true);
  });

  it("arrows move between the colors without moving the page's own selection", () => {
    render(<ThemePicker />);
    open();
    const amber = screen.getByRole("button", { name: i18n.t("theme.presets.amber") });
    amber.focus();
    const event = fireEvent.keyDown(amber, { key: "ArrowRight" });
    expect(event).toBe(false); // preventDefault
    expect(screen.getByRole("button", { name: i18n.t("theme.presets.red") })).toHaveFocus();
  });

  it("closes when you click outside", () => {
    render(
      <div>
        <p>afuera</p>
        <ThemePicker />
      </div>
    );
    open();
    fireEvent.mouseDown(screen.getByText("afuera"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("on a narrow screen the window moves back inside the screen instead of opening cut off", () => {
    // El botón termina en x=177 y la ventana mide 252: abierta a la derecha quedaría en x=-75.
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function rect() {
      return this.classList?.contains("tp")
        ? { left: 100, right: 177, width: 77, top: 20, bottom: 50, height: 30 }
        : { left: 0, right: 0, width: 0, top: 0, bottom: 0, height: 0 };
    });
    const width = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function w() {
      return this.classList?.contains("tp-panel") ? 252 : 0;
    });
    window.innerWidth = 390;
    render(<ThemePicker />);
    const panel = open();
    expect(panel.style.right).toBe("-83px"); // corre 75 + 8 de margen hacia adentro
    rect.mockRestore();
    width.mockRestore();
  });

  it("has every text in both languages", () => {
    const keys = ["open", "title", "hue", ...ACCENT_PRESETS.map((p) => `presets.${p.id}`)];
    keys.forEach((key) => ["es", "en"].forEach((lng) => expect(i18n.exists(`theme.${key}`, { lng })).toBe(true)));
  });
});
