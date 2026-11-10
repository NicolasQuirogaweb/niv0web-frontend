import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../i18n/config";
import { CatalogConsole } from "./CatalogConsole";

const CATALOGS = [
  { _id: "p1", title: "Archetype", itemsCount: 9 },
  { _id: "p2", title: "Furious Trap", itemsCount: 1 },
  { _id: "p3", title: "Rambo", itemsCount: 5 },
];

const renderConsole = (props = {}, items = CATALOGS) =>
  render(
    <MemoryRouter>
      <CatalogConsole items={items} resourceType="beats" {...props} />
    </MemoryRouter>
  );

const links = () => screen.getAllByRole("link");
const feature = (container) => container.querySelector(".sleeve-feature");

describe("CatalogConsole (contratapa del disco)", () => {
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

  it("splits the catalogs into side A and side B, numbered like a record's tracklist", () => {
    renderConsole();
    const sideA = screen.getByRole("list", { name: i18n.t("catalog.side", { side: "A" }) });
    const sideB = screen.getByRole("list", { name: i18n.t("catalog.side", { side: "B" }) });
    expect(within(sideA).getAllByRole("link").map((a) => a.textContent)).toEqual([
      expect.stringContaining("A1"),
      expect.stringContaining("A2"),
    ]);
    expect(within(sideB).getByRole("link")).toHaveTextContent("B1");
    expect(within(sideB).getByRole("link")).toHaveTextContent("Rambo");
  });

  it("a single catalog has no side B", () => {
    renderConsole({}, CATALOGS.slice(0, 1));
    expect(screen.queryByRole("list", { name: i18n.t("catalog.side", { side: "B" }) })).toBeNull();
  });

  it("starts with the first catalog featured at the bottom, like the home menu", () => {
    const { container } = renderConsole();
    expect(links()[0]).toHaveAttribute("data-active", "true");
    expect(feature(container)).toHaveTextContent("Archetype");
    expect(feature(container)).toHaveAttribute("aria-hidden", "true");
  });

  it("the mouse or keyboard focus features another catalog", () => {
    const { container } = renderConsole();
    fireEvent.mouseEnter(links()[1]);
    expect(links()[1]).toHaveAttribute("data-active", "true");
    expect(links()[0]).toHaveAttribute("data-active", "false");
    expect(feature(container)).toHaveTextContent("Furious Trap");
    fireEvent.focus(links()[2]);
    expect(feature(container)).toHaveTextContent("Rambo");
  });

  it("links loop catalogs to their own pages and counts loops", () => {
    renderConsole({ resourceType: "loops" });
    expect(links()[0]).toHaveAttribute("href", "/loops/playlist/p1");
    expect(links()[0]).toHaveTextContent(i18n.t("card.items_loops", { count: 9 }));
  });

  it("takes getHref, getMeta and getBadge from the caller; the badge goes where the count was", () => {
    const { container } = renderConsole({
      getHref: (i) => `/x/${i._id}`,
      getMeta: (i) => `meta ${i.title}`,
      getBadge: (i) => (i._id === "p1" ? "FREE" : null),
    });
    expect(links().map((a) => a.getAttribute("href"))).toEqual(["/x/p1", "/x/p2", "/x/p3"]);
    expect(links()[0]).toHaveTextContent("meta Archetype");
    expect(links()[0].querySelector(".sleeve-row-end")).toHaveTextContent("FREE");
    expect(links()[1].querySelector(".sleeve-row-end")).toHaveTextContent("1");
    expect(feature(container)).toHaveTextContent("FREE");
    fireEvent.focus(links()[2]);
    expect(feature(container)).toHaveTextContent("meta Rambo");
  });

  it("drops the old spinning record and 3D bars", () => {
    const { container } = renderConsole();
    expect(container.querySelector(".catalog-record, .catalog-blade, .orb-ring")).toBeNull();
  });
});
