import { render, screen, fireEvent, act } from "@testing-library/react";
import { usePlaylistPlayer } from "./usePlaylistPlayer";

// jsdom no reproduce audio: play/pause cambian `paused` y disparan los mismos
// eventos que el navegador. Cada play() queda registrado con el src que tenía.
let playCalls;
let handlers;
let session;

beforeEach(() => {
  playCalls = [];
  handlers = {};
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function () {
    playCalls.push(this.getAttribute("src"));
    Object.defineProperty(this, "paused", { value: false, configurable: true });
    this.dispatchEvent(new Event("play"));
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  });
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
  { _id: "b", title: "Dos", audioFile: "https://x/2.mp3" },
  { _id: "c", title: "Tres", audioFile: "https://x/3.mp3" },
];

const Harness = ({ autoAdvance, tracks = TRACKS }) => {
  const p = usePlaylistPlayer(tracks, { autoAdvance, meta: { album: "Catálogo", artwork: "https://x/cover.jpg" } });
  return (
    <div>
      <audio data-testid="audio" {...p.audioProps} />
      <p data-testid="state">{`${p.currentIndex ?? "none"}|${p.isPlaying ? "playing" : "stopped"}`}</p>
      <button onClick={p.togglePlayAll}>all</button>
      <button onClick={() => p.toggleTrack(2)}>third</button>
    </div>
  );
};

const state = () => screen.getByTestId("state").textContent;
const audio = () => screen.getByTestId("audio");
const endTrack = () =>
  act(() => {
    Object.defineProperty(audio(), "paused", { value: true, configurable: true });
    fireEvent(audio(), new Event("ended"));
  });

describe("usePlaylistPlayer", () => {
  it("play all starts with the first track", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("all"));
    expect(state()).toBe("0|playing");
    expect(audio()).toHaveAttribute("src", "https://x/1.mp3");
  });

  it("moves to the next track when one ends, calling play() right away", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("all"));
    endTrack();
    expect(state()).toBe("1|playing");
    expect(playCalls).toEqual(["https://x/1.mp3", "https://x/2.mp3"]);
  });

  it("stops after the last track instead of looping", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("third"));
    endTrack();
    expect(state()).toBe("2|stopped");
    expect(session.playbackState).toBe("paused");
  });

  it("does not advance when autoAdvance is off (sample packs)", () => {
    render(<Harness autoAdvance={false} />);
    fireEvent.click(screen.getByText("all"));
    endTrack();
    expect(state()).toBe("0|stopped");
    expect(handlers.nexttrack).toBeNull();
  });

  it("pressing play all again pauses, and once more resumes the same track", () => {
    render(<Harness autoAdvance />);
    const all = screen.getByText("all");
    fireEvent.click(all);
    fireEvent.click(all);
    expect(state()).toBe("0|stopped");
    fireEvent.click(all);
    expect(state()).toBe("0|playing");
    expect(playCalls).toEqual(["https://x/1.mp3", "https://x/1.mp3"]);
  });

  it("clicking another track switches to it", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("all"));
    fireEvent.click(screen.getByText("third"));
    expect(state()).toBe("2|playing");
  });

  describe("lock screen (Media Session)", () => {
    it("'next' from the notification starts the next track synchronously, inside the handler", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      playCalls = [];

      // Sin act(): si el play() dependiera de un re-render de React no estaría acá todavía.
      handlers.nexttrack();
      expect(playCalls).toEqual(["https://x/2.mp3"]);
      expect(audio().getAttribute("src")).toBe("https://x/2.mp3");
      expect(session.metadata.title).toBe("Dos");
      expect(session.metadata.album).toBe("Catálogo");
    });

    it("keeps the session 'playing' while switching tracks (the src change pause is ignored)", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));

      // Orden real del navegador al cambiar el src de un audio que suena:
      // "pause" (por el src nuevo), "play" y recién después "playing", cuando hay datos.
      HTMLMediaElement.prototype.play.mockImplementation(function () {
        this.dispatchEvent(new Event("pause"));
        this.dispatchEvent(new Event("play"));
        return Promise.resolve();
      });
      act(() => handlers.nexttrack());
      expect(session.playbackState).not.toBe("paused");
      expect(state()).toBe("1|playing");

      act(() => {
        audio().dispatchEvent(new Event("playing"));
      });
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
      expect(state()).toBe("1|playing");

      Object.defineProperty(audio(), "currentTime", { value: 30, writable: true, configurable: true });
      act(() => handlers.previoustrack());
      expect(state()).toBe("1|playing");
      expect(audio().currentTime).toBe(0);
    });

    it("pause and play from the notification are explicit, not a toggle", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      act(() => handlers.pause());
      act(() => handlers.pause());
      expect(state()).toBe("0|stopped");
      expect(session.playbackState).toBe("paused");
      act(() => handlers.play());
      act(() => handlers.play());
      expect(state()).toBe("0|playing");
      expect(session.playbackState).toBe("playing");
    });

    it("a failed play() leaves the player stopped instead of stuck", async () => {
      HTMLMediaElement.prototype.play.mockImplementation(() => Promise.reject(new Error("NotAllowedError")));
      render(<Harness autoAdvance />);
      await act(async () => {
        fireEvent.click(screen.getByText("all"));
      });
      expect(state()).toBe("0|stopped");
    });

    it("skips a track that fails to load", () => {
      render(<Harness autoAdvance />);
      fireEvent.click(screen.getByText("all"));
      act(() => {
        fireEvent(audio(), new Event("error"));
      });
      expect(state()).toBe("1|playing");
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
