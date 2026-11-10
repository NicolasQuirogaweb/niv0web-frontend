import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import i18n from "../../i18n/config";
import { LowerThirdMenu } from "./LowerThirdMenu";

const renderMenu = () =>
  render(
    <MemoryRouter>
      <LowerThirdMenu />
    </MemoryRouter>
  );

const EXPECTED = [
  ["home.beats", "/beats", "home.sub.beats"],
  ["home.samplePacks", "/samplepacks", "home.sub.samplePacks"],
  ["home.loops", "/loops", "home.sub.loops"],
  ["home.about", "/about", "home.sub.about"],
  ["home.prodMixMaster", "/prodmixmaster", "home.sub.prodMixMaster"],
];

const nav = () => screen.getByRole("navigation", { name: i18n.t("home.menuLabel") });
const links = () => [...nav().querySelectorAll("a")];
const title = (container) => container.querySelector(".lt-title");
const sub = (container) => container.querySelector(".lt-sub");

describe("LowerThirdMenu", () => {
  it("is a named navigation with the five sections in order", () => {
    renderMenu();
    expect(links().map((a) => [a.textContent, a.getAttribute("href")])).toEqual(
      EXPECTED.map(([key, href]) => [i18n.t(key), href])
    );
  });

  it("every section has its own subtitle in both languages", () => {
    ["es", "en"].forEach((lng) => {
      EXPECTED.forEach(([, , subKey]) => {
        expect(i18n.exists(subKey, { lng })).toBe(true);
      });
    });
  });

  it("starts with the first section big, with its subtitle", () => {
    const { container } = renderMenu();
    expect(links()[0]).toHaveAttribute("data-active", "true");
    expect(links().filter((a) => a.dataset.active === "true")).toHaveLength(1);
    expect(title(container)).toHaveTextContent(i18n.t("home.beats"));
    expect(title(container)).toHaveAttribute("href", "/beats");
    expect(sub(container)).toHaveTextContent(i18n.t("home.sub.beats"));
  });

  it("the big name and subtitle follow the mouse and keyboard focus", () => {
    const { container } = renderMenu();
    fireEvent.mouseEnter(links()[2]);
    expect(links()[2]).toHaveAttribute("data-active", "true");
    expect(links()[0]).toHaveAttribute("data-active", "false");
    expect(title(container)).toHaveTextContent(i18n.t("home.loops"));
    expect(sub(container)).toHaveTextContent(i18n.t("home.sub.loops"));
    fireEvent.focus(links()[4]);
    expect(title(container)).toHaveAttribute("href", "/prodmixmaster");
  });

  it("the big name is a shortcut for the mouse, hidden from screen readers and Tab", () => {
    const { container } = renderMenu();
    expect(title(container)).toHaveAttribute("aria-hidden", "true");
    expect(title(container)).toHaveAttribute("tabindex", "-1");
    expect(sub(container)).toHaveAttribute("aria-hidden", "true");
  });

  it("moves with ↑ ↓ and ← → and wraps around", () => {
    renderMenu();
    links()[0].focus();
    fireEvent.keyDown(links()[0], { key: "ArrowRight" });
    expect(links()[1]).toHaveFocus();
    fireEvent.keyDown(links()[1], { key: "ArrowDown" });
    expect(links()[2]).toHaveFocus();
    fireEvent.keyDown(links()[2], { key: "ArrowLeft" });
    fireEvent.keyDown(links()[1], { key: "ArrowUp" });
    fireEvent.keyDown(links()[0], { key: "ArrowLeft" });
    expect(links()[4]).toHaveFocus();
    fireEvent.keyDown(links()[4], { key: "ArrowRight" });
    expect(links()[0]).toHaveFocus();
  });

  it("moves with the arrows as soon as the page opens, without clicking the menu first", () => {
    renderMenu();
    fireEvent.keyDown(document.body, { key: "ArrowDown" });
    expect(links()[1]).toHaveAttribute("data-active", "true");
    expect(links()[1]).toHaveFocus();
  });

  it("Enter opens the section picked with the mouse even when nothing has focus", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<LowerThirdMenu />} />
          <Route path="/loops" element={<p>loops page</p>} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.mouseEnter(links()[2]);
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(screen.getByText("loops page")).toBeInTheDocument();
  });

  it("leaves browser shortcuts alone (Alt + ← is the browser's back)", () => {
    renderMenu();
    const notPrevented = fireEvent.keyDown(document.body, { key: "ArrowLeft", altKey: true });
    expect(notPrevented).toBe(true);
    expect(links()[0]).toHaveAttribute("data-active", "true");
  });

  it("leaves the keys alone when something on the page already used them", () => {
    renderMenu();
    const widget = (e) => e.preventDefault();
    document.addEventListener("keydown", widget);
    fireEvent.keyDown(document.body, { key: "ArrowDown" });
    document.removeEventListener("keydown", widget);
    expect(links()[0]).toHaveAttribute("data-active", "true");
  });

  it("leaves the arrows alone while typing in a field", () => {
    render(
      <MemoryRouter>
        <input aria-label="search" />
        <LowerThirdMenu />
      </MemoryRouter>
    );
    const field = screen.getByLabelText("search");
    field.focus();
    fireEvent.keyDown(field, { key: "ArrowRight" });
    expect(links()[0]).toHaveAttribute("data-active", "true");
    expect(field).toHaveFocus();
  });
});
