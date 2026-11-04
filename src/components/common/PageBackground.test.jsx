import { render, act } from "@testing-library/react";
import { PageBackground, canPlayBackgroundVideo } from "./PageBackground";

const POSTER = "https://x/poster.webp";
const VIDEO = "https://x/bg-720.mp4";
const VIDEO_MOBILE = "https://x/bg-480.mp4";

// jsdom no trae matchMedia ni connection: cada test arma el "navegador" que necesita.
const setBrowser = ({ reducedMotion = false, mobile = false, connection } = {}) => {
  window.matchMedia = (query) => ({
    matches: (query.includes("prefers-reduced-motion") && reducedMotion) || (query.includes("max-width") && mobile),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  Object.defineProperty(navigator, "connection", { value: connection, configurable: true });
};

const setVisibility = (state) => {
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
};

beforeEach(() => {
  setBrowser();
  Object.defineProperty(document, "readyState", { value: "complete", configurable: true });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  setVisibility("visible");
});

const video = (container) => container.querySelector("video");

describe("PageBackground", () => {
  it("shows the image right away, as the poster of the video", () => {
    const { container } = render(<PageBackground media={{ poster: POSTER, video: VIDEO }} />);
    expect(container.querySelector(".page-bg").style.backgroundImage).toContain(POSTER);
    expect(video(container)).toHaveAttribute("poster", POSTER);
  });

  it("is only an image when the section has no video", () => {
    const { container } = render(<PageBackground media={{ poster: POSTER }} />);
    expect(video(container)).toBeNull();
  });

  it("is muted, loops, plays inline and is hidden from screen readers", () => {
    const { container } = render(<PageBackground media={{ poster: POSTER, video: VIDEO }} />);
    const v = video(container);
    expect(v.muted).toBe(true);
    expect(v).toHaveAttribute("loop");
    expect(v).toHaveAttribute("playsinline");
    expect(container.querySelector(".page-bg")).toHaveAttribute("aria-hidden", "true");
  });

  // React no escribe el atributo `muted` en el HTML y algunos navegadores no
  // arrancan el autoplay sin él: el componente marca el video como mudo y le da play.
  it("starts playing on its own once it appears, muted", () => {
    const { container } = render(<PageBackground media={{ poster: POSTER, video: VIDEO }} />);
    expect(video(container).defaultMuted).toBe(true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("keeps the image if the browser refuses to play the video", async () => {
    HTMLMediaElement.prototype.play.mockRejectedValue(new DOMException("blocked", "NotAllowedError"));
    const { container } = render(<PageBackground media={{ poster: POSTER, video: VIDEO }} />);
    await act(async () => {});
    expect(container.querySelector(".page-bg").style.backgroundImage).toContain(POSTER);
  });

  it("uses the lighter video on small screens", () => {
    setBrowser({ mobile: true });
    const { container } = render(<PageBackground media={{ poster: POSTER, video: VIDEO, videoMobile: VIDEO_MOBILE }} />);
    expect(video(container)).toHaveAttribute("src", VIDEO_MOBILE);
  });

  it("waits for the page to finish loading before loading the video", () => {
    Object.defineProperty(document, "readyState", { value: "loading", configurable: true });
    const { container } = render(<PageBackground media={{ poster: POSTER, video: VIDEO }} />);
    expect(video(container)).toBeNull();
    act(() => window.dispatchEvent(new Event("load")));
    expect(video(container)).toHaveAttribute("src", VIDEO);
  });

  it("pauses when the tab is hidden and resumes when it comes back", () => {
    const { container } = render(<PageBackground media={{ poster: POSTER, video: VIDEO }} />);
    act(() => setVisibility("hidden"));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    act(() => setVisibility("visible"));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    expect(video(container)).not.toBeNull();
  });

  it.each([
    ["reduced motion", { reducedMotion: true }],
    ["data saver", { connection: { saveData: true, effectiveType: "4g" } }],
    ["a slow 3G connection", { connection: { saveData: false, effectiveType: "3g" } }],
    ["2G", { connection: { saveData: false, effectiveType: "2g" } }],
  ])("stays a still image with %s", (_label, browser) => {
    setBrowser(browser);
    const { container } = render(<PageBackground media={{ poster: POSTER, video: VIDEO }} />);
    expect(video(container)).toBeNull();
    expect(container.querySelector(".page-bg").style.backgroundImage).toContain(POSTER);
  });
});

describe("canPlayBackgroundVideo", () => {
  it("allows video on a normal 4G or wifi connection", () => {
    setBrowser({ connection: { saveData: false, effectiveType: "4g" } });
    expect(canPlayBackgroundVideo()).toBe(true);
  });

  it("allows video when the browser does not report the connection", () => {
    setBrowser({ connection: undefined });
    expect(canPlayBackgroundVideo()).toBe(true);
  });
});
