import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import i18n from "../i18n/config";
import { CardPlaylist } from "./CardPlaylist";

const renderCard = (props) =>
  render(
    <MemoryRouter>
      <CardPlaylist {...props} />
    </MemoryRouter>
  );

describe("CardPlaylist", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("is one link to the catalog, named after it, with how many beats it has", () => {
    renderCard({ playlist: { _id: "p1", title: "Archetype", imageUrl: "https://x/a.jpg", itemsCount: 9 }, resourceType: "beats" });
    const link = screen.getByRole("link", { name: /Archetype/ });
    expect(link).toHaveAttribute("href", "/beats/playlist/p1");
    expect(link).toHaveTextContent(i18n.t("card.items_beats", { count: 9 }));
  });

  it("links sample packs to their own page and counts samples", () => {
    renderCard({ playlist: { _id: "s1", title: "Drums", imageUrl: "https://x/d.jpg", itemsCount: 36 }, resourceType: "samples" });
    const link = screen.getByRole("link", { name: /Drums/ });
    expect(link).toHaveAttribute("href", "/samples/samplepack/s1");
    expect(link).toHaveTextContent(i18n.t("card.items_samples", { count: 36 }));
  });

  it("uses the singular for a single item", () => {
    renderCard({ playlist: { _id: "p2", title: "One", imageUrl: "x", itemsCount: 1 }, resourceType: "beats" });
    expect(screen.getByRole("link")).toHaveTextContent(i18n.t("card.items_beats", { count: 1 }));
    expect(i18n.t("card.items_beats", { count: 1 })).not.toBe(i18n.t("card.items_beats", { count: 2 }));
  });

  it("the equalizer is decoration only", () => {
    const { container } = renderCard({ playlist: { _id: "p1", title: "A", imageUrl: "x", itemsCount: 3 }, resourceType: "beats" });
    expect(container.querySelector(".card-eq")).toHaveAttribute("aria-hidden", "true");
  });
});
