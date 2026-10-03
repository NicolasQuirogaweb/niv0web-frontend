import { render, screen, fireEvent, act } from "@testing-library/react";
import { usePlaylistPlayer } from "./usePlaylistPlayer";

// jsdom no reproduce audio: play/pause cambian `paused` y disparan los mismos
// eventos que el navegador. Cada play() queda registrado con el elemento y su src.
let plays;
let handlers;
let session;
const lastPlayed = () => plays[plays.length - 1].el;

const mockPlay = ({ emitPlaying = true } = {}) =>
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function () {
    plays.push({ el: this, src: this.getAttribute("src") });
    Object.defineProperty(this, "paused", { value: false, configurable: true });
    this.dispatchEvent(new Event("play"));
    if (emitPlaying) this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  });

beforeEach(() => {
  plays = [];
  handlers = {};
  mockPlay();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function () {
    Object.defineProperty(this, "paused", { value: true, configurable: true });
    this.dispatchEvent(new Event("pause"));
  });
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});

  session = {
    playbackState: "none",
    metadata: null,
    setActionHandler: vi.fn((action, fn) => {
      handlers[action] = fn;
    }),
    setPositionState: vi.fn(),
  };
  Object.defineProperty(navigator, "mediaSession", { value: session, configurable: true });
  window.MediaMetadata = class {
    constructor(init) {
      Object.assign(this, init);
    }
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  delete navigator.mediaSession;
  delete window.MediaMetadata;
});

const TRACKS = [
  { _id: "a", title: "Uno", audioFile: "https://x/1.mp3" },
  { _id: "b", title: "Dos", audioFile: "https://x/2.wav", previewFile: "https://x/2-preview.mp3" },
  { _id: "c", title: "Tres", audioFile: "https://x/3.mp3" },
];

const Harness = ({ autoAdvance, tracks = TRACKS }) => {
  const p = usePlaylistPlayer(tracks, { autoAdvance, meta: { album: "Catálogo", artwork: "https://x/cover.jpg" } });
  return (
    <div>
      <p data-testid="state">{`${p.currentIndex ?? "none"}|${p.isPlaying ? "playing" : "stopped"}|${p.isLoading ? "loading" : "ready"}`}</p>
      <button onClick={p.togglePlayAll}>all</button>
      <button onClick={() => p.toggleTrack(2)}>third</button>
    </div>
  );
};

const state = () => screen.getByTestId("state").textContent;
const fire = (type, el = lastPlayed()) =>
  act(() => {
    if (type === "ended") Object.defineProperty(el, "paused", { value: true, configurable: true });
    el.dispatchEvent(new Event(type));
  });

describe("usePlaylistPlayer", () => {
  it("play all starts with the first track", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("all"));
    expect(state()).toBe("0|playing|ready");
    expect(plays.map((p) => p.src)).toEqual(["https://x/1.mp3"]);
  });

  it("moves to the next track when one ends, calling play() right away", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("all"));
    fire("ended");
    expect(state()).toBe("1|playing|ready");
    expect(plays.map((p) => p.src)).toEqual(["https://x/1.mp3", "https://x/2-preview.mp3"]);
  });

  it("stops after the last track instead of looping", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("third"));
    fire("ended");
    expect(state()).toBe("2|stopped|ready");
    expect(session.playbackState).toBe("paused");
  });

  it("does not advance when autoAdvance is off (sample packs)", () => {
    render(<Harness autoAdvance={false} />);
    fireEvent.click(screen.getByText("all"));
    fire("ended");
    expect(state()).toBe("0|stopped|ready");
    expect(handlers.nexttrack).toBeNull();
  });

  it("pressing play all again pauses, and once more resumes the same track", () => {
    render(<Harness autoAdvance />);
    const all = screen.getByText("all");
    fireEvent.click(all);
    fireEvent.click(all);
    expect(state()).toBe("0|stopped|ready");
    fireEvent.click(all);
    expect(state()).toBe("0|playing|ready");
    expect(plays.map((p) => p.src)).toEqual(["https://x/1.mp3", "https://x/1.mp3"]);
  });

  it("clicking another track switches to it", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("all"));
    fireEvent.click(screen.getByText("third"));
    expect(state()).toBe("2|playing|ready");
  });

  describe("speed", () => {
    it("plays the MP3 preview of a WAV, never the WAV, when there is one", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      act(() => handlers.nexttrack());
      expect(lastPlayed().getAttribute("src")).toBe("https://x/2-preview.mp3");
    });

    it("preloads the next track while the current one plays, and switches to it on 'next'", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      const first = lastPlayed();
      // El otro elemento ya tiene el siguiente tema cargando.
      const loads = HTMLMediaElement.prototype.load.mock.contexts;
      const preloader = loads[loads.length - 1];
      expect(preloader).not.toBe(first);
      expect(preloader.getAttribute("src")).toBe("https://x/2-preview.mp3");
      expect(preloader.preload).toBe("auto");

      plays = [];
      handlers.nexttrack(); // sin act(): el play() tiene que ocurrir dentro del handler
      expect(plays).toHaveLength(1);
      expect(plays[0].el).toBe(preloader);
      expect(first.paused).toBe(true);
    });

    it("shows a loading state until the new track actually starts", () => {
      HTMLMediaElement.prototype.play.mockRestore();
      mockPlay({ emitPlaying: false });
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      expect(state()).toBe("0|playing|loading");
      fire("playing");
      expect(state()).toBe("0|playing|ready");
      fire("waiting");
      expect(state()).toBe("0|playing|loading");
    });

    it("falls back to the original file when the preview fails", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      act(() => handlers.nexttrack());
      const el = lastPlayed();
      plays = [];
      fire("error", el);
      expect(plays.map((p) => p.src)).toEqual(["https://x/2.wav"]);
      expect(state()).toBe("1|playing|ready");
    });

    it("skips a track whose original also fails", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      fire("error");
      expect(state()).toBe("1|playing|ready");
    });
  });

  describe("lock screen (Media Session)", () => {
    it("'next' from the notification starts the next track synchronously, inside the handler", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      plays = [];
      handlers.nexttrack();
      expect(plays.map((p) => p.src)).toEqual(["https://x/2-preview.mp3"]);
      expect(session.metadata.title).toBe("Dos");
      expect(session.metadata.album).toBe("Catálogo");
    });

    it("keeps the session 'playing' while switching tracks (the src change pause is ignored)", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("third"));
      act(() => handlers.previoustrack()); // vuelve a "Dos" sin precarga: mismo elemento, src nuevo
      HTMLMediaElement.prototype.play.mockRestore();
      vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function () {
        plays.push({ el: this, src: this.getAttribute("src") });
        this.dispatchEvent(new Event("pause")); // lo que hace el navegador al cambiar el src
        this.dispatchEvent(new Event("play"));
        return Promise.resolve();
      });
      act(() => handlers.previoustrack());
      expect(session.playbackState).not.toBe("paused");
      expect(state()).toBe("0|playing|loading");
      fire("playing");
      expect(session.playbackState).toBe("playing");
    });

    it("hides 'next' on the last track", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("third"));
      expect(handlers.nexttrack).toBeNull();
      expect(typeof handlers.previoustrack).toBe("function");
    });

    it("'previous' goes back one track, or restarts it after a few seconds", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("third"));
      act(() => handlers.previoustrack());
      expect(state()).toBe("1|playing|ready");

      const el = lastPlayed();
      Object.defineProperty(el, "currentTime", { value: 30, writable: true, configurable: true });
      act(() => handlers.previoustrack());
      expect(state()).toBe("1|playing|ready");
      expect(el.currentTime).toBe(0);
    });

    it("pause and play from the notification are explicit, not a toggle", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      act(() => handlers.pause());
      act(() => handlers.pause());
      expect(state()).toBe("0|stopped|ready");
      expect(session.playbackState).toBe("paused");
      act(() => handlers.play());
      act(() => handlers.play());
      expect(state()).toBe("0|playing|ready");
      expect(session.playbackState).toBe("playing");
    });

    it("a failed play() leaves the player stopped instead of stuck", async () => {
      HTMLMediaElement.prototype.play.mockImplementation(() => Promise.reject(new Error("NotAllowedError")));
      render(<Harness autoAdvance />);
      await act(async () => {
        fireEvent.click(screen.getByText("all"));
      });
      expect(state()).toBe("0|stopped|ready");
    });

    it("clears the session when the page unmounts", () => {
      const { unmount } = render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      unmount();
      expect(session.metadata).toBeNull();
      expect(session.playbackState).toBe("none");
      expect(handlers.nexttrack).toBeNull();
    });
  });
});
