import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { useConsoleNav } from "./useConsoleNav";

// jsdom no calcula posiciones: cada item declara su caja en data-rect="left,top,width,height".
const placeItems = () => {
  document.querySelectorAll("[data-rect]").forEach((el) => {
    const [left, top, width, height] = el.dataset.rect.split(",").map(Number);
    el.getBoundingClientRect = () => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top });
  });
};

// Grilla de 3 × 2 (A B C / D E F), cada card de 100 × 100 con 20 de separación.
const Grid = ({ back = "/home", onPress }) => {
  useConsoleNav({ back });
  const cards = ["A", "B", "C", "D", "E", "F"];
  return (
    <div>
      <input aria-label="search" />
      <div role="slider" tabIndex={0} aria-label="seek" aria-valuenow={0} />
      {cards.map((name, i) => (
        <Link
          key={name}
          to={`/card/${name}`}
          data-nav-item=""
          data-rect={`${(i % 3) * 120},${Math.floor(i / 3) * 120},100,100`}
        >
          {name}
        </Link>
      ))}
      <div data-nav-item="" data-nav-press=".play" data-rect="0,300,340,40">
        Track
        <button type="button" className="play" onClick={onPress}>play</button>
      </div>
    </div>
  );
};

const renderGrid = (props) => {
  const utils = render(
    <MemoryRouter initialEntries={["/catalog"]}>
      <Routes>
        <Route path="/catalog" element={<Grid {...props} />} />
        <Route path="/card/:name" element={<p>opened card</p>} />
        <Route path="/home" element={<p>home page</p>} />
      </Routes>
    </MemoryRouter>
  );
  placeItems();
  return utils;
};

const key = (k, opts = {}) => fireEvent.keyDown(document.activeElement || document.body, { key: k, ...opts });
const activeText = () => document.querySelector('[data-nav-active="true"]')?.textContent;

describe("useConsoleNav", () => {
  it("the first arrow selects the first item and focuses it", () => {
    renderGrid();
    expect(activeText()).toBeUndefined();
    key("ArrowDown");
    expect(activeText()).toBe("A");
    expect(screen.getByText("A")).toHaveFocus();
  });

  it("moves through a grid in the four directions and stops at the edges", () => {
    renderGrid();
    key("ArrowRight");
    key("ArrowRight");
    expect(activeText()).toBe("B");
    key("ArrowRight");
    expect(activeText()).toBe("C");
    key("ArrowRight");
    expect(activeText()).toBe("C");
    key("ArrowDown");
    expect(activeText()).toBe("F");
    key("ArrowLeft");
    expect(activeText()).toBe("E");
    key("ArrowUp");
    expect(activeText()).toBe("B");
    key("ArrowUp");
    expect(activeText()).toBe("B");
  });

  it("goes down from the grid to the item below it", () => {
    renderGrid();
    key("ArrowDown");
    key("ArrowDown");
    key("ArrowDown");
    expect(activeText()).toMatch(/^Track/);
    expect(screen.getByRole("button", { name: "play" })).toHaveFocus();
  });

  it("the mouse selects too, and Enter opens what the mouse picked", () => {
    renderGrid();
    fireEvent.mouseOver(screen.getByText("E"));
    expect(activeText()).toBe("E");
    document.body.focus();
    key("Enter");
    expect(screen.getByText("opened card")).toBeInTheDocument();
  });

  it("Enter presses the item's own button once", () => {
    const onPress = vi.fn();
    renderGrid({ onPress });
    fireEvent.mouseOver(screen.getByText("Track"));
    document.body.focus();
    key("Enter");
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("Esc goes back", () => {
    renderGrid();
    key("Escape");
    expect(screen.getByText("home page")).toBeInTheDocument();
  });

  it("Esc leaves the page alone when something on it already used the key", () => {
    renderGrid();
    const closeVinyl = (e) => e.preventDefault();
    document.addEventListener("keydown", closeVinyl);
    key("Escape");
    document.removeEventListener("keydown", closeVinyl);
    expect(screen.queryByText("home page")).not.toBeInTheDocument();
  });

  it("leaves the keys to text fields and sliders", () => {
    renderGrid();
    screen.getByLabelText("search").focus();
    key("ArrowDown");
    key("Escape");
    expect(activeText()).toBeUndefined();
    screen.getByRole("slider").focus();
    key("ArrowRight");
    expect(activeText()).toBeUndefined();
    expect(screen.queryByText("home page")).not.toBeInTheDocument();
  });

  it("leaves browser shortcuts alone (Alt + ← is the browser's back)", () => {
    renderGrid();
    key("ArrowLeft", { altKey: true });
    key("ArrowDown", { ctrlKey: true });
    expect(activeText()).toBeUndefined();
  });

  it("works without a back path", () => {
    renderGrid({ back: null });
    key("Escape");
    expect(screen.queryByText("home page")).not.toBeInTheDocument();
  });
});
