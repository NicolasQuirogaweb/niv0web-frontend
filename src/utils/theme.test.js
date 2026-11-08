import { ACCENT_PRESETS, DEFAULT_HUE, accentRgb, applyAccent, loadAccentHue, saveAccentHue } from "./theme";

describe("accent theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("style");
  });

  it("the default hue gives back the site's amber exactly", () => {
    expect(DEFAULT_HUE).toBe(38);
    expect(accentRgb(DEFAULT_HUE)).toEqual([245, 194, 107]);
  });

  it("has six presets, amber first, each with its own hue", () => {
    expect(ACCENT_PRESETS).toHaveLength(6);
    expect(ACCENT_PRESETS[0]).toEqual({ id: "amber", hue: DEFAULT_HUE });
    expect(new Set(ACCENT_PRESETS.map((p) => p.hue)).size).toBe(6);
  });

  it("applies a hue to the whole page through the accent tokens", () => {
    applyAccent(205);
    const style = document.documentElement.style;
    expect(style.getPropertyValue("--color-accent-rgb")).toBe(accentRgb(205).join(" "));
    expect(style.getPropertyValue("--color-accent-strong")).toMatch(/^rgb\(\d+ \d+ \d+\)$/);
  });

  it("remembers the chosen hue for the next visit", () => {
    saveAccentHue(160);
    expect(loadAccentHue()).toBe(160);
  });

  it("falls back to amber when nothing or garbage is stored", () => {
    expect(loadAccentHue()).toBe(DEFAULT_HUE);
    localStorage.setItem("accentHue", "banana");
    expect(loadAccentHue()).toBe(DEFAULT_HUE);
    localStorage.setItem("accentHue", "999");
    expect(loadAccentHue()).toBe(DEFAULT_HUE);
  });

  it("does not break when the browser blocks storage", () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadAccentHue()).toBe(DEFAULT_HUE);
    expect(() => saveAccentHue(100)).not.toThrow();
    get.mockRestore();
    set.mockRestore();
  });
});
