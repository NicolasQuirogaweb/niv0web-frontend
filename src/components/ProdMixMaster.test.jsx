import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../i18n/config";
import { ProdMixMaster, PLAYLIST_ID } from "./ProdMixMaster";

vi.mock("../hooks/useAuth", () => ({ useLogout: () => vi.fn() }));

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <ProdMixMaster />
      </MemoryRouter>
    </HelmetProvider>
  );

describe("ProdMixMaster page", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("shows the playlist inside the page with Spotify's player, named for screen readers", () => {
    renderPage();
    const player = screen.getByTitle(i18n.t("prodMix.playerTitle"));
    expect(player.tagName).toBe("IFRAME");
    expect(player).toHaveAttribute("src", expect.stringContaining(`open.spotify.com/embed/playlist/${PLAYLIST_ID}`));
    expect(player).toHaveAttribute("allow", expect.stringContaining("encrypted-media"));
  });

  it("offers to hire niv0 and to open the playlist in Spotify, both in a new tab", () => {
    renderPage();
    const hire = screen.getByRole("link", { name: i18n.t("prodMix.hire") });
    expect(hire).toHaveAttribute("href", expect.stringContaining("instagram.com/__niv0__"));
    const open = screen.getByRole("link", { name: i18n.t("prodMix.openSpotify") });
    expect(open).toHaveAttribute("href", `https://open.spotify.com/playlist/${PLAYLIST_ID}`);
    [hire, open].forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("has every text in both languages", () => {
    ["title", "subtitle", "playerTitle", "hire", "openSpotify"].forEach((key) => {
      ["es", "en"].forEach((lng) => expect(i18n.exists(`prodMix.${key}`, { lng })).toBe(true));
    });
  });
});
