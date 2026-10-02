import { render, screen, fireEvent, act } from "@testing-library/react";
import { usePlaylistPlayer } from "./usePlaylistPlayer";

// jsdom no reproduce audio: play/pause solo disparan los eventos que usa el hook.
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function () {
    Object.defineProperty(this, "paused", { value: false, configurable: true });
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function () {
    Object.defineProperty(this, "paused", { value: true, configurable: true });
    this.dispatchEvent(new Event("pause"));
  });
});

afterEach(() => vi.restoreAllMocks());

const TRACKS = [
  { _id: "a", title: "Uno", audioFile: "https://x/1.mp3" },
  { _id: "b", title: "Dos", audioFile: "https://x/2.mp3" },
  { _id: "c", title: "Tres", audioFile: "https://x/3.mp3" },
];

const Harness = ({ autoAdvance }) => {
  const p = usePlaylistPlayer(TRACKS, { autoAdvance });
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
const endTrack = () => act(() => {
  const audio = screen.getByTestId("audio");
  Object.defineProperty(audio, "paused", { value: true, configurable: true });
  fireEvent(audio, new Event("ended"));
});

describe("usePlaylistPlayer", () => {
  it("play all starts with the first track", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("all"));
    expect(state()).toBe("0|playing");
    expect(screen.getByTestId("audio")).toHaveAttribute("src", "https://x/1.mp3");
  });

  it("moves to the next track when one ends", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("all"));
    endTrack();
    expect(state()).toBe("1|playing");
    expect(screen.getByTestId("audio")).toHaveAttribute("src", "https://x/2.mp3");
  });

  it("stops after the last track instead of looping", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("third"));
    endTrack();
    expect(state()).toBe("2|stopped");
  });

  it("does not advance when autoAdvance is off (sample packs)", () => {
    render(<Harness autoAdvance={false} />);
    fireEvent.click(screen.getByText("all"));
    endTrack();
    expect(state()).toBe("0|stopped");
  });

  it("pressing play all again pauses, and once more resumes the same track", () => {
    render(<Harness autoAdvance />);
    const all = screen.getByText("all");
    fireEvent.click(all);
    fireEvent.click(all);
    expect(state()).toBe("0|stopped");
    fireEvent.click(all);
    expect(state()).toBe("0|playing");
  });

  it("clicking another track switches to it", () => {
    render(<Harness autoAdvance />);
    fireEvent.click(screen.getByText("all"));
    fireEvent.click(screen.getByText("third"));
    expect(state()).toBe("2|playing");
  });
});
