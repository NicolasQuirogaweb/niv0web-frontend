import { render, screen, fireEvent } from "@testing-library/react";
import i18n from "../../i18n/config";
import { AudioPlayer } from "./AudioPlayer";

const renderPlayer = (props = {}) => {
  const onSeek = vi.fn();
  render(
    <AudioPlayer isActive isPlaying currentTime={10} duration={100} onToggle={() => {}} onSeek={onSeek} {...props} />
  );
  const bar = screen.getByRole("slider", { name: i18n.t("player.seek") });
  bar.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 32, right: 200, bottom: 32 });
  bar.setPointerCapture = vi.fn();
  bar.releasePointerCapture = vi.fn();
  return { bar, onSeek };
};

// jsdom no trae PointerEvent: un MouseEvent con el nombre del evento alcanza para clientX.
const pointer = (el, type, clientX) => el.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX }));

describe("AudioPlayer seek bar", () => {
  it("jumps to where you press", () => {
    const { bar, onSeek } = renderPlayer();
    pointer(bar, "pointerdown", 50);
    expect(onSeek).toHaveBeenLastCalledWith(25);
  });

  it("follows the finger or mouse while dragging, and stops when released", () => {
    const { bar, onSeek } = renderPlayer();
    pointer(bar, "pointerdown", 20);
    pointer(bar, "pointermove", 100);
    expect(onSeek).toHaveBeenLastCalledWith(50);
    pointer(bar, "pointerup", 100);
    onSeek.mockClear();
    pointer(bar, "pointermove", 180);
    expect(onSeek).not.toHaveBeenCalled();
  });

  it("does nothing on a row that isn't playing", () => {
    const { bar, onSeek } = renderPlayer({ isActive: false });
    pointer(bar, "pointerdown", 50);
    expect(onSeek).not.toHaveBeenCalled();
  });

  it("keeps the arrows for keyboard users", () => {
    const { bar, onSeek } = renderPlayer();
    fireEvent.keyDown(bar, { key: "ArrowRight" });
    expect(onSeek).toHaveBeenLastCalledWith(15);
  });
});
