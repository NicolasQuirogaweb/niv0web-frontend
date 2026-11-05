import { render, act } from "@testing-library/react";
import { SpotifyPlayer } from "./SpotifyPlayer";
import { resetSpotifyIframeApiForTests } from "../../utils/spotifyEmbed";

// Imita la API de iframes de Spotify: carga el script y llama a onSpotifyIframeApiReady.
const fakeApi = () => {
  const controller = { loadUri: vi.fn(), play: vi.fn(), destroy: vi.fn(), listeners: {} };
  controller.addListener = vi.fn((event, fn) => (controller.listeners[event] = fn));
  const api = {
    createController: vi.fn((el, options, callback) => callback(controller)),
  };
  return { api, controller };
};

const loadScript = (api) =>
  act(async () => {
    window.onSpotifyIframeApiReady(api);
    await Promise.resolve();
  });

beforeEach(() => {
  resetSpotifyIframeApiForTests();
  document.querySelectorAll("script[data-spotify-iframe-api]").forEach((s) => s.remove());
});

describe("SpotifyPlayer", () => {
  it("loads Spotify's player for the album and starts it as soon as it's ready", async () => {
    const { api, controller } = fakeApi();
    render(<SpotifyPlayer albumId="alb1" title="Archetype" />);
    expect(document.querySelector("script[data-spotify-iframe-api]")).toHaveAttribute(
      "src",
      "https://open.spotify.com/embed/iframe-api/v1"
    );
    await loadScript(api);
    expect(api.createController).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ uri: "spotify:album:alb1" }),
      expect.any(Function)
    );
    controller.listeners.ready();
    expect(controller.play).toHaveBeenCalledTimes(1);
  });

  it("switching albums loads the new one in the same player and plays it", async () => {
    const { api, controller } = fakeApi();
    const { rerender } = render(<SpotifyPlayer albumId="alb1" title="Archetype" />);
    await loadScript(api);
    rerender(<SpotifyPlayer albumId="alb2" title="Night Drive" />);
    expect(api.createController).toHaveBeenCalledTimes(1);
    expect(controller.loadUri).toHaveBeenCalledWith("spotify:album:alb2");
    expect(controller.play).toHaveBeenCalled();
  });

  it("falls back to Spotify's plain embed if the player script can't load (blockers)", async () => {
    const { container } = render(<SpotifyPlayer albumId="alb1" title="Archetype" />);
    await act(async () => {
      document.querySelector("script[data-spotify-iframe-api]").dispatchEvent(new Event("error"));
      await Promise.resolve();
    });
    expect(container.querySelector("iframe")).toHaveAttribute("src", "https://open.spotify.com/embed/album/alb1");
  });

  it("closes the player when it leaves the page", async () => {
    const { api, controller } = fakeApi();
    const { unmount } = render(<SpotifyPlayer albumId="alb1" title="Archetype" />);
    await loadScript(api);
    unmount();
    expect(controller.destroy).toHaveBeenCalled();
  });
});
