import { render, screen, fireEvent } from "@testing-library/react";
import "../../i18n/config";
import { SampleBrowser, flattenFolders } from "./SampleBrowser";

const folders = [
  {
    name: "Drums",
    samples: [
      { _id: "a", title: "kick", durationSec: 2.4 },
      { _id: "b", title: "snare" },
    ],
  },
  { name: "Bass", samples: [{ _id: "c", title: "sub" }] },
];

const makePlayer = (over = {}) => ({
  currentIndex: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  toggleTrack: vi.fn(),
  ...over,
});

const item = (name) => screen.getByRole("treeitem", { name: new RegExp(name) });
const press = (k, opts = {}) => fireEvent.keyDown(document.activeElement, { key: k, ...opts });

describe("SampleBrowser", () => {
  beforeEach(() => localStorage.setItem("lang", "es"));

  it("flattens samples in folder order", () => {
    expect(flattenFolders(folders).map((s) => s._id)).toEqual(["a", "b", "c"]);
  });

  it("renders a tree with 2 folders and only the first open", () => {
    render(<SampleBrowser folders={folders} player={makePlayer()} />);
    expect(screen.getByRole("tree", { name: "Contenido del pack" })).toBeInTheDocument();
    expect(item("Drums")).toHaveAttribute("aria-expanded", "true");
    expect(item("Bass")).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking a sample after opening its folder calls toggleTrack with the flat index", () => {
    const player = makePlayer();
    render(<SampleBrowser folders={folders} player={player} />);
    fireEvent.click(item("Bass"));
    fireEvent.click(item("sub"));
    expect(player.toggleTrack).toHaveBeenCalledWith(2);
  });

  it("ArrowDown goes to the first sample and ArrowLeft back to the folder", () => {
    render(<SampleBrowser folders={folders} player={makePlayer()} />);
    item("Drums").focus();
    press("ArrowDown");
    expect(item("kick")).toHaveFocus();
    press("ArrowLeft");
    expect(item("Drums")).toHaveFocus();
  });

  it("handles keys only when it handles them, and prevents default", () => {
    render(<SampleBrowser folders={folders} player={makePlayer()} />);
    item("Drums").focus();
    expect(fireEvent.keyDown(document.activeElement, { key: "ArrowDown" })).toBe(false);
    expect(fireEvent.keyDown(document.activeElement, { key: " " })).toBe(false);
    expect(fireEvent.keyDown(document.activeElement, { key: "ArrowDown", altKey: true })).toBe(true);
  });

  it("ArrowRight opens a closed folder, then moves into it; Home and End jump", () => {
    render(<SampleBrowser folders={folders} player={makePlayer()} />);
    item("Bass").focus();
    press("ArrowRight");
    expect(item("Bass")).toHaveAttribute("aria-expanded", "true");
    press("ArrowRight");
    expect(item("sub")).toHaveFocus();
    press("Home");
    expect(item("Drums")).toHaveFocus();
    press("End");
    expect(item("sub")).toHaveFocus();
  });

  it("Enter toggles a folder and plays a sample; Space too", () => {
    const player = makePlayer();
    render(<SampleBrowser folders={folders} player={player} />);
    item("Drums").focus();
    press("Enter");
    expect(item("Drums")).toHaveAttribute("aria-expanded", "false");
    press(" ");
    expect(item("Drums")).toHaveAttribute("aria-expanded", "true");
    press("ArrowDown");
    press("ArrowDown");
    press(" ");
    expect(player.toggleTrack).toHaveBeenCalledWith(1);
  });

  it("roving tabindex: one tabbable item, the first folder by default", () => {
    const { container } = render(<SampleBrowser folders={folders} player={makePlayer()} />);
    const tabbable = container.querySelectorAll('[role="treeitem"][tabindex="0"]');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent("Drums");
  });

  it("moves tabindex to the folder when the focused sample's folder collapses", () => {
    const { container } = render(<SampleBrowser folders={folders} player={makePlayer()} />);
    item("Drums").focus();
    press("ArrowDown");
    expect(item("kick")).toHaveAttribute("tabindex", "0");
    fireEvent.click(item("Drums"));
    const tabbable = container.querySelectorAll('[role="treeitem"][tabindex="0"]');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent("Drums");
  });

  it("marks the playing sample and shows it in the now-playing bar", () => {
    render(
      <SampleBrowser
        folders={folders}
        player={makePlayer({ currentIndex: 1, isPlaying: true, currentTime: 1, duration: 4 })}
      />
    );
    expect(item("snare")).toHaveAttribute("aria-selected", "true");
    expect(item("kick")).not.toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Drums · snare")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  });

  it("shows the idle text when nothing plays", () => {
    render(<SampleBrowser folders={folders} player={makePlayer()} />);
    expect(screen.getByText("Tocá un sample para escucharlo")).toBeInTheDocument();
  });

  it("renders durations as m:ss", () => {
    render(<SampleBrowser folders={folders} player={makePlayer()} />);
    expect(screen.getByText("0:02")).toBeInTheDocument();
  });

  it("has no download control", () => {
    render(<SampleBrowser folders={folders} player={makePlayer()} />);
    expect(screen.queryByRole("button", { name: /descarg|download/i })).toBeNull();
  });
});
