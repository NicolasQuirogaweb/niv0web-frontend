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

  it("has every text in both languages", () => {
    const keys = ["open", "title", "hue", ...ACCENT_PRESETS.map((p) => `presets.${p.id}`)];
    keys.forEach((key) => ["es", "en"].forEach((lng) => expect(i18n.exists(`theme.${key}`, { lng })).toBe(true)));
  });
});
