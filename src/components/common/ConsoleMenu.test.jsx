import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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

  it("fills the orb with sound bars, hidden from screen readers", () => {
    const { container } = renderMenu();
    const orb = container.querySelector(".console-orb");
    expect(orb).toHaveAttribute("aria-hidden", "true");
    expect(orb.querySelectorAll(".console-orb-bar")).toHaveLength(7);
    expect(orb).toHaveTextContent("");
  });
});
