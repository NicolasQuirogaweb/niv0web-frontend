import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../../i18n/config";
import { useConsoleNav } from "../../hooks/useConsoleNav";
import { SampleBrowser, flattenFolders, formatDuration, waveBars } from "./SampleBrowser";

const folders = [
  {
    name: "Drums",
    samples: [
      { _id: "a", title: "kick", durationSec: 2.4, audioFile: "https://cdn/kick.wav" },
      { _id: "b", title: "snare" },
    ],
  },
  { name: "Bass", samples: [{ _id: "c", title: "sub" }, { _id: "d", title: "Café Reese", durationSec: 23 }] },
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

const renderBrowser = (player = makePlayer(), props = {}) =>
  render(<SampleBrowser folders={folders} player={player} packTitle="Mastermind" zipBytes={143 * 1024 * 1024} {...props} />);

const item = (name) => screen.getByRole("treeitem", { name: new RegExp(name) });
const press = (k, opts = {}) => fireEvent.keyDown(document.activeElement, { key: k, ...opts });
const screenName = (container) => container.querySelector(".sb-now").textContent;
const screenMeta = (container) => container.querySelector(".sb-meta").textContent;
const search = () => screen.getByRole("searchbox", { name: "Buscar samples" });

describe("SampleBrowser", () => {
  beforeEach(() => localStorage.setItem("lang", "es"));

  it("flattens samples in folder order", () => {
    expect(flattenFolders(folders).map((s) => s._id)).toEqual(["a", "b", "c", "d"]);
  });

  it("renders a tree with 2 folders and only the first open", () => {
    renderBrowser();
    expect(screen.getByRole("tree", { name: "Contenido del pack" })).toBeInTheDocument();
    expect(item("Drums")).toHaveAttribute("aria-expanded", "true");
    expect(item("Bass")).toHaveAttribute("aria-expanded", "false");
  });

  it("shows folder, sample and ZIP stats in the title bar", () => {
    renderBrowser();
    expect(screen.getByText("2 carpetas · 4 samples · ZIP 143 MB")).toBeInTheDocument();
    expect(screen.getByText("niv0 · Mastermind")).toBeInTheDocument();
  });

  it("clicking a sample after opening its folder calls toggleTrack with the flat index", () => {
    const player = makePlayer();
    renderBrowser(player);
    fireEvent.click(item("Bass"));
    fireEvent.click(item("sub"));
    expect(player.toggleTrack).toHaveBeenCalledWith(2);
  });

  it("ArrowDown goes to the first sample and ArrowLeft back to the folder", () => {
    renderBrowser();
    item("Drums").focus();
    press("ArrowDown");
    expect(item("kick")).toHaveFocus();
    press("ArrowLeft");
    expect(item("Drums")).toHaveFocus();
  });

  it("handles keys only when it handles them, and prevents default", () => {
    renderBrowser();
    item("Drums").focus();
    expect(fireEvent.keyDown(document.activeElement, { key: "ArrowDown" })).toBe(false);
    expect(fireEvent.keyDown(document.activeElement, { key: " " })).toBe(false);
    expect(fireEvent.keyDown(document.activeElement, { key: "ArrowDown", altKey: true })).toBe(true);
    expect(fireEvent.keyDown(document.activeElement, { key: "Escape" })).toBe(true);
  });

  it("ArrowRight opens a closed folder, then moves into it; Home and End jump", () => {
    renderBrowser();
    item("Bass").focus();
    press("ArrowRight");
    expect(item("Bass")).toHaveAttribute("aria-expanded", "true");
    press("ArrowRight");
    expect(item("sub")).toHaveFocus();
    press("Home");
    expect(item("Drums")).toHaveFocus();
    press("End");
    expect(item("Café Reese")).toHaveFocus();
  });

  it("Enter toggles a folder and plays a sample; Space too", () => {
    const player = makePlayer();
    renderBrowser(player);
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
    const { container } = renderBrowser();
    const tabbable = container.querySelectorAll('[role="treeitem"][tabindex="0"]');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent("Drums");
  });

  it("moves tabindex to the folder when the focused sample's folder collapses", () => {
    const { container } = renderBrowser();
    item("Drums").focus();
    press("ArrowDown");
    expect(item("kick")).toHaveAttribute("tabindex", "0");
    fireEvent.click(item("Drums"));
    const tabbable = container.querySelectorAll('[role="treeitem"][tabindex="0"]');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent("Drums");
  });

  describe("screen", () => {
    it("shows the idle text before anything is selected", () => {
      const { container } = renderBrowser();
      expect(screenName(container)).toBe("Tocá un sample para escucharlo");
    });

    it("clicking a folder shows its name and sample count", () => {
      const { container } = renderBrowser();
      fireEvent.click(item("Bass"));
      expect(screenName(container)).toBe("Bass");
      expect(screenMeta(container)).toBe("2 samples");
      expect(item("Bass")).toHaveAttribute("aria-selected", "true");
    });

    it("focusing a folder with the keyboard selects it", () => {
      const { container } = renderBrowser();
      act(() => item("Drums").focus());
      expect(screenName(container)).toBe("Drums");
      press("End");
      expect(screenName(container)).toBe("Bass");
      expect(screenMeta(container)).toBe("2 samples");
    });

    it("selecting a sample shows its title, duration and path", () => {
      const { container } = renderBrowser();
      fireEvent.click(item("kick"));
      expect(screenName(container)).toBe("kick");
      expect(screenMeta(container)).toContain("2.4 s");
      expect(container.querySelector(".sb-path")).toHaveTextContent("Mastermind / Drums / kick");
    });

    it("shows the playing sample when nothing was picked, with its progress", () => {
      const { container } = renderBrowser(makePlayer({ currentIndex: 1, isPlaying: true, currentTime: 1, duration: 4 }));
      expect(item("snare")).toHaveAttribute("aria-selected", "true");
      expect(item("snare")).toHaveAttribute("aria-current", "true");
      expect(item("kick")).not.toHaveAttribute("aria-selected", "true");
      expect(screenName(container)).toBe("snare");
      const bar = screen.getByRole("progressbar", { name: "Avance del sample" });
      expect(bar).toHaveAttribute("aria-valuenow", "25");
    });

    it("progress is clamped and NaN-safe", () => {
      const { rerender } = renderBrowser(makePlayer({ currentIndex: 0, currentTime: 9, duration: 4 }));
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
      rerender(
        <SampleBrowser folders={folders} player={makePlayer({ currentIndex: 0, currentTime: 1, duration: NaN })} packTitle="M" />
      );
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    });

    it("a selected sample that is not playing shows no progress", () => {
      renderBrowser(makePlayer({ currentIndex: 1, isPlaying: true, currentTime: 1, duration: 4 }));
      fireEvent.click(item("kick"));
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    });
  });

  describe("search", () => {
    it("filters samples by title, accent and case insensitive, opening the folders with matches", () => {
      renderBrowser();
      fireEvent.change(search(), { target: { value: "CAFE" } });
      expect(item("Café Reese")).toBeInTheDocument();
      expect(item("Bass")).toHaveAttribute("aria-expanded", "true");
      expect(screen.queryByRole("treeitem", { name: /sub/ })).toBeNull();
      expect(screen.queryByRole("treeitem", { name: /Drums/ })).toBeNull();
    });

    it("keeps the player index of the full pack while filtering", () => {
      const player = makePlayer();
      renderBrowser(player);
      fireEvent.change(search(), { target: { value: "reese" } });
      fireEvent.click(item("Café Reese"));
      expect(player.toggleTrack).toHaveBeenCalledWith(3);
    });

    it("shows a no-results line when nothing matches", () => {
      renderBrowser();
      fireEvent.change(search(), { target: { value: "zzz" } });
      expect(screen.queryAllByRole("treeitem")).toHaveLength(0);
      expect(screen.getByText("Ningún sample coincide con “zzz”")).toBeInTheDocument();
    });

    it("Escape in the search clears it and does not go back", () => {
      const Page = () => {
        useConsoleNav({ back: "/back" });
        return <SampleBrowser folders={folders} player={makePlayer()} packTitle="M" />;
      };
      render(
        <MemoryRouter initialEntries={["/pack"]}>
          <Routes>
            <Route path="/pack" element={<Page />} />
            <Route path="/back" element={<p>BACK</p>} />
          </Routes>
        </MemoryRouter>
      );
      search().focus();
      fireEvent.change(search(), { target: { value: "kick" } });
      expect(fireEvent.keyDown(search(), { key: "Escape" })).toBe(false);
      expect(search()).toHaveValue("");
      expect(screen.queryByText("BACK")).toBeNull();
      expect(item("Bass")).toHaveAttribute("aria-expanded", "false");
    });

    it("Escape in the tree clears an active search instead of going back", () => {
      renderBrowser();
      fireEvent.change(search(), { target: { value: "sub" } });
      item("sub").focus();
      expect(press("Escape")).toBe(false);
      expect(search()).toHaveValue("");
    });
  });

  it("formats durations: tenths under 10 s, m:ss from there", () => {
    expect(formatDuration(0.4)).toBe("0.4 s");
    expect(formatDuration(0.08)).toBe("0.1 s");
    expect(formatDuration(0.02)).toBe("<0.1 s");
    expect(formatDuration(2.4)).toBe("2.4 s");
    expect(formatDuration(9.97)).toBe("0:10");
    expect(formatDuration(23)).toBe("0:23");
    expect(formatDuration(65)).toBe("1:05");
  });

  it("renders row durations with the new format", () => {
    renderBrowser();
    expect(screen.getByText("2.4 s")).toBeInTheDocument();
  });

  it("waveform shapes are stable per seed and differ between seeds", () => {
    expect(waveBars("a", 48)).toEqual(waveBars("a", 48));
    expect(waveBars("a", 48)).toHaveLength(48);
    expect(waveBars("a", 48)).not.toEqual(waveBars("b", 48));
    waveBars("xyz", 48).forEach((h) => {
      expect(h).toBeGreaterThan(0);
      expect(h).toBeLessThanOrEqual(1);
    });
  });

  it("has no download control", () => {
    renderBrowser();
    expect(screen.queryByRole("button", { name: /descarg|download/i })).toBeNull();
  });
});
