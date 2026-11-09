import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../i18n/config";
import { Playlist } from "./Playlist";
import { beatsService, loopsService } from "../services/api";

vi.mock("../hooks/useAuth", () => ({ useLogout: () => vi.fn() }));

vi.mock("../services/api", () => {
  const beatsService = { getById: vi.fn() };
  const loopsService = { getById: vi.fn() };
  return {
    beatsService,
    loopsService,
    playlistServices: { beats: beatsService, loops: loopsService },
    downloadService: { file: vi.fn() },
  };
});

const renderAt = (path) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:resourceType/playlist/:playlistId" element={<Playlist />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe("Playlist page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches a beats catalog and lists its beats", async () => {
    beatsService.getById.mockResolvedValue({
      data: { _id: "p1", title: "Beats Vol. 1", beats: [{ _id: "b1", title: "Night Drive", audioFile: "https://x/a.mp3" }] },
    });

    renderAt("/beats/playlist/p1");

    expect(await screen.findByText("Night Drive")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: i18n.t("player.playAll") })).toBeInTheDocument();
    expect(beatsService.getById).toHaveBeenCalledWith("p1");
    expect(loopsService.getById).not.toHaveBeenCalled();
  });

  it("beat catalogs are listen-only: no download button, and a note about licenses", async () => {
    beatsService.getById.mockResolvedValue({
      data: { _id: "p1", title: "Beats Vol. 1", beats: [{ _id: "b1", title: "Night Drive", audioFile: "https://x/a.mp3" }] },
    });
    renderAt("/beats/playlist/p1");

    expect(await screen.findByText("Night Drive")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: new RegExp(i18n.t("playlist.download")) })).not.toBeInTheDocument();
    expect(screen.getByText(i18n.t("playlist.beatsLicenseNote"))).toBeInTheDocument();
  });

  it("beat catalogs don't say the beats are free for non-profit use (they aren't downloadable)", async () => {
    beatsService.getById.mockResolvedValue({
      data: { _id: "p1", title: "Beats Vol. 1", beats: [{ _id: "b1", title: "Night Drive", audioFile: "https://x/a.mp3" }] },
    });
    renderAt("/beats/playlist/p1");

    expect(await screen.findByText("Night Drive")).toBeInTheDocument();
    expect(screen.queryByText(i18n.t("playlist.freeLicense"))).not.toBeInTheDocument();
  });

  it("loop catalogs still say loops are free for non-profit use", async () => {
    loopsService.getById.mockResolvedValue({
      data: { _id: "p2", title: "Loop Pack", loops: [{ _id: "l1", title: "Rhodes 90bpm", audioFile: "https://x/l.mp3" }] },
    });
    renderAt("/loops/playlist/p2");

    expect(await screen.findByText("Rhodes 90bpm")).toBeInTheDocument();
    expect(screen.getByText(i18n.t("playlist.freeLicense"))).toBeInTheDocument();
  });

  it("loop catalogs keep their download buttons", async () => {
    loopsService.getById.mockResolvedValue({
      data: { _id: "p2", title: "Loop Pack", loops: [{ _id: "l1", title: "Rhodes 90bpm", audioFile: "https://x/l.mp3" }] },
    });
    renderAt("/loops/playlist/p2");

    expect(await screen.findByText("Rhodes 90bpm")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(i18n.t("playlist.download")) })).toBeInTheDocument();
  });

  it("fetches a loops catalog through the loops service (it used to always ask for beats)", async () => {
    loopsService.getById.mockResolvedValue({
      data: { _id: "p2", title: "Loop Pack", loops: [{ _id: "l1", title: "Rhodes 90bpm", audioFile: "https://x/l.mp3" }] },
    });

    renderAt("/loops/playlist/p2");

    expect(await screen.findByText("Rhodes 90bpm")).toBeInTheDocument();
    expect(loopsService.getById).toHaveBeenCalledWith("p2");
    expect(beatsService.getById).not.toHaveBeenCalled();
  });

  it("does not call any service for an unknown resource type", async () => {
    renderAt("/whatever/playlist/p3");

    expect(await screen.findByText(/404|no encontrad|not found/i)).toBeInTheDocument();
    expect(beatsService.getById).not.toHaveBeenCalled();
    expect(loopsService.getById).not.toHaveBeenCalled();
  });
});
