import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../i18n/config";
import { CatalogConsole } from "./CatalogConsole";

const CATALOGS = [
  { _id: "p1", title: "Archetype", imageUrl: "https://x/archetype.png", itemsCount: 9 },
  { _id: "p2", title: "Furious Trap", imageUrl: "https://x/furious.png", itemsCount: 1 },
  { _id: "p3", title: "Rambo", imageUrl: null, itemsCount: 5 },
];

const renderConsole = (props = {}) =>
  render(
    <MemoryRouter>
      <CatalogConsole items={CATALOGS} resourceType="beats" {...props} />
    </MemoryRouter>
  );

const links = () => screen.getAllByRole("link");
const label = (container) => container.querySelector(".catalog-record-label");
const caption = (container) => container.querySelector(".catalog-record-caption");

describe("CatalogConsole", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("lists every catalog as a link with its name and how many beats it has, ready for the arrows", () => {
    renderConsole();
    expect(screen.getByRole("navigation", { name: i18n.t("catalog.listLabel") })).toBeInTheDocument();
    expect(links().map((a) => a.getAttribute("href"))).toEqual(["/beats/playlist/p1", "/beats/playlist/p2", "/beats/playlist/p3"]);
    expect(links()[0]).toHaveTextContent("Archetype");
    expect(links()[0]).toHaveTextContent(i18n.t("card.items_beats", { count: 9 }));
    expect(links()[1]).toHaveTextContent(i18n.t("card.items_beats", { count: 1 }));
    links().forEach((a) => expect(a).toHaveAttribute("data-nav-item"));
  });

  it("starts with the first catalog on the record, like the home menu", () => {
    const { container } = renderConsole();
    expect(links()[0]).toHaveAttribute("data-active", "true");
    expect(label(container)).toHaveStyle({ backgroundImage: "url(https://x/archetype.png)" });
    expect(caption(container)).toHaveTextContent("Archetype");
    expect(container.querySelector(".catalog-record")).toHaveAttribute("aria-hidden", "true");
  });

  it("the mouse or keyboard focus puts another catalog on the record", () => {
    const { container } = renderConsole();
    fireEvent.mouseEnter(links()[1]);
    expect(links()[1]).toHaveAttribute("data-active", "true");
    expect(links()[0]).toHaveAttribute("data-active", "false");
    expect(label(container)).toHaveStyle({ backgroundImage: "url(https://x/furious.png)" });
    fireEvent.focus(links()[2]);
    expect(caption(container)).toHaveTextContent("Rambo");
    expect(label(container).style.backgroundImage).toBe("");
  });

  it("links loop catalogs to their own pages and counts loops", () => {
    renderConsole({ resourceType: "loops" });
    expect(links()[0]).toHaveAttribute("href", "/loops/playlist/p1");
    expect(links()[0]).toHaveTextContent(i18n.t("card.items_loops", { count: 9 }));
  });

  it("surrounds the record with the ring of small bars and the scale, like the home orb", () => {
    const { container } = renderConsole();
    expect(container.querySelectorAll(".catalog-record .orb-ring > i")).toHaveLength(64);
    expect(container.querySelectorAll(".catalog-record .orb-ticks")).toHaveLength(2);
  });
});
