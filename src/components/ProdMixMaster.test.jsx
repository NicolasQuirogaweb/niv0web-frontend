import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../i18n/config";
import { ProdMixMaster } from "./ProdMixMaster";

vi.mock("../hooks/useAuth", () => ({ useLogout: () => vi.fn() }));

describe("ProdMixMaster page", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("shows the service as a glass card that opens the Spotify playlist in a new tab", () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <ProdMixMaster />
        </MemoryRouter>
      </HelmetProvider>
    );
    const card = screen.getByRole("link", { name: new RegExp(i18n.t("prodMix.title")) });
    expect(card).toHaveAttribute("href", expect.stringContaining("open.spotify.com/playlist/"));
    expect(card).toHaveAttribute("target", "_blank");
    expect(card).toHaveAttribute("rel", "noopener noreferrer");
    expect(card).toHaveTextContent(i18n.t("prodMix.openSpotify"));
    expect(card).toHaveClass("glass-card");
    expect(container.querySelector(".card-eq")).toHaveAttribute("aria-hidden", "true");
  });
});
