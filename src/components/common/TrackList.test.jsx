import { render, screen, fireEvent, act } from "@testing-library/react";
import i18n from "../../i18n/config";
import { TrackList } from "./TrackList";
import { downloadService } from "../../services/api";
import { fileExtension } from "../../utils/download";

vi.mock("../../services/api", () => ({
  downloadService: { link: vi.fn(), file: vi.fn() },
}));

const TRACKS = [{ _id: "a", title: "Night Drive", audioFile: "https://x/beats/night.wav" }];
const player = {
  currentIndex: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  toggleTrack: vi.fn(),
  seek: vi.fn(),
};

const downloadButton = () => screen.getByRole("button", { name: new RegExp(i18n.t("playlist.download")) });

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom no navega: el click en el link de descarga no tiene efecto.
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("TrackList downloads", () => {
  it("asks for one signed link no matter how many times you tap", async () => {
    let resolveLink;
    downloadService.link.mockReturnValue(new Promise((r) => { resolveLink = r; }));
    render(<TrackList tracks={TRACKS} player={player} />);

    const button = downloadButton();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(downloadService.link).toHaveBeenCalledTimes(1);
    expect(downloadService.link).toHaveBeenCalledWith("https://x/beats/night.wav", "Night Drive");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await act(async () => resolveLink({ data: { url: "https://f005.backblazeb2.com/file/b/night.wav?Authorization=t" } }));
    expect(screen.getByRole("button", { name: i18n.t("playlist.downloadStarted") })).toBeDisabled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(downloadService.file).not.toHaveBeenCalled();
  });

  it("falls back to the proxy when the link can't be generated", async () => {
    downloadService.link.mockRejectedValue(new Error("502"));
    downloadService.file.mockResolvedValue({ data: new Blob(["x"]) });
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
    render(<TrackList tracks={TRACKS} player={player} />);

    await act(async () => fireEvent.click(downloadButton()));
    expect(downloadService.file).toHaveBeenCalledWith("https://x/beats/night.wav");
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
  });

  it("explains that a beat WAV comes with the license, without retrying through the proxy", async () => {
    downloadService.link.mockRejectedValue({ response: { status: 403, data: { code: "LICENSE_REQUIRED" } } });
    render(<TrackList tracks={TRACKS} player={player} />);

    await act(async () => fireEvent.click(downloadButton()));
    expect(screen.getByRole("alert")).toHaveTextContent(i18n.t("playlist.licenseRequired"));
    expect(downloadService.file).not.toHaveBeenCalled();
  });

  it("shows an error when both ways fail", async () => {
    downloadService.link.mockRejectedValue(new Error("502"));
    downloadService.file.mockRejectedValue(new Error("502"));
    render(<TrackList tracks={TRACKS} player={player} />);

    await act(async () => fireEvent.click(downloadButton()));
    expect(screen.getByRole("alert")).toHaveTextContent(i18n.t("playlist.downloadError"));
  });
});

describe("fileExtension", () => {
  it("keeps the real extension so a WAV isn't saved as .mp3", () => {
    expect(fileExtension("https://x/a/b.WAV")).toBe(".wav");
    expect(fileExtension("https://x/a/b.mp3?x=1")).toBe(".mp3");
    expect(fileExtension("https://x/a/b")).toBe("");
  });
});
