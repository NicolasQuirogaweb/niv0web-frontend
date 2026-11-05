import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import i18n from "../../i18n/config";
import { ConsoleMenu } from "./ConsoleMenu";

const renderMenu = () =>
  render(
    <MemoryRouter>
      <ConsoleMenu />
    </MemoryRouter>
  );

const EXPECTED = [
  ["home.beats", "/beats"],
  ["home.samplePacks", "/samplepacks"],
  ["home.loops", "/loops"],
  ["home.about", "/about"],
  ["home.prodMixMaster", "/prodmixmaster"],
];

const links = () => screen.getAllByRole("link");

describe("ConsoleMenu", () => {
  it("is a named navigation with the five sections in order", () => {
    renderMenu();
    expect(screen.getByRole("navigation", { name: i18n.t("home.menuLabel") })).toBeInTheDocument();
    expect(links().map((a) => [a.textContent, a.getAttribute("href")])).toEqual(
      EXPECTED.map(([key, href]) => [i18n.t(key), href])
    );
  });

  it("starts with the first section selected, like the console", () => {
    renderMenu();
    expect(links()[0]).toHaveAttribute("data-active", "true");
    expect(links().filter((a) => a.dataset.active === "true")).toHaveLength(1);
  });

  it("selects the section under the mouse or with keyboard focus", () => {
    renderMenu();
    fireEvent.mouseEnter(links()[2]);
    expect(links()[2]).toHaveAttribute("data-active", "true");
    expect(links()[0]).toHaveAttribute("data-active", "false");
    fireEvent.focus(links()[4]);
    expect(links()[4]).toHaveAttribute("data-active", "true");
  });

  it("moves with the arrow keys and wraps around", () => {
    renderMenu();
    links()[0].focus();
    fireEvent.keyDown(links()[0], { key: "ArrowDown" });
    expect(links()[1]).toHaveFocus();
    fireEvent.keyDown(links()[1], { key: "ArrowUp" });
    fireEvent.keyDown(links()[0], { key: "ArrowUp" });
    expect(links()[4]).toHaveFocus();
    fireEvent.keyDown(links()[4], { key: "ArrowDown" });
    expect(links()[0]).toHaveFocus();
  });

  it("moves with the arrows as soon as the page opens, without clicking the menu first", () => {
    renderMenu();
    fireEvent.keyDown(document.body, { key: "ArrowDown" });
    expect(links()[1]).toHaveAttribute("data-active", "true");
    expect(links()[1]).toHaveFocus();
    fireEvent.keyDown(document.activeElement, { key: "ArrowUp" });
    fireEvent.keyDown(document.activeElement, { key: "ArrowUp" });
    expect(links()[4]).toHaveAttribute("data-active", "true");
  });

  it("Enter opens the section picked with the mouse even when nothing has focus", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<ConsoleMenu />} />
          <Route path="/loops" element={<p>loops page</p>} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.mouseEnter(links()[2]);
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(screen.getByText("loops page")).toBeInTheDocument();
  });

  it("leaves the arrows alone while typing in a field", () => {
    render(
      <MemoryRouter>
        <input aria-label="search" />
        <ConsoleMenu />
      </MemoryRouter>
    );
    const field = screen.getByLabelText("search");
    field.focus();
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(links()[0]).toHaveAttribute("data-active", "true");
    expect(field).toHaveFocus();
  });

  it("rings the orb with 64 small bars and a scale, all hidden from screen readers", () => {
    const { container } = renderMenu();
    const orb = container.querySelector(".console-orb");
    expect(orb.querySelectorAll(".console-orb-ring > i")).toHaveLength(64);
    expect(orb.querySelectorAll(".console-orb-ticks")).toHaveLength(2);
  });

  it("joins each section to the orb with a line and lights the selected one", () => {
    const { container } = renderMenu();
    const lines = container.querySelectorAll(".console-lines path");
    expect(lines).toHaveLength(5);
    expect(container.querySelector(".console-lines")).toHaveAttribute("aria-hidden", "true");
    expect(lines[0]).toHaveAttribute("data-active", "true");
    fireEvent.mouseEnter(links()[3]);
    expect(lines[3]).toHaveAttribute("data-active", "true");
    expect(lines[0]).toHaveAttribute("data-active", "false");
  });

  it("the orb reacts when the selection changes, not when it stays the same", () => {
    const { container } = renderMenu();
    const menu = container.querySelector(".console-menu");
    fireEvent.mouseEnter(links()[0]);
    expect(menu).not.toHaveClass("is-kick");
    fireEvent.mouseEnter(links()[2]);
    expect(menu).toHaveClass("is-kick");
  });

  it("fills the orb with sound bars, hidden from screen readers", () => {
    const { container } = renderMenu();
    const orb = container.querySelector(".console-orb");
    expect(orb).toHaveAttribute("aria-hidden", "true");
    expect(orb.querySelectorAll(".console-orb-bar")).toHaveLength(7);
    expect(orb).toHaveTextContent("");
  });
});
