import { render, screen, fireEvent, within } from "@testing-library/react";
import i18n from "../../i18n/config";
import { VinylGrid } from "./VinylGrid";

const ALBUMS = [
  {
    spotifyId: "alb1",
    name: "Archetype",
    type: "album",
    releaseDate: "2025-08-01",
    imageUrl: "https://i.scdn.co/image/a",
    spotifyUrl: "https://open.spotify.com/album/alb1",
    totalTracks: 9,
  },
  {
    spotifyId: "sgl1",
    name: "Night Drive",
    type: "single",
    releaseDate: "2021",
    imageUrl: null,
    spotifyUrl: "https://open.spotify.com/album/sgl1",
    totalTracks: 1,
  },
];

const player = () => screen.queryByTitle(/Spotify/);

describe("VinylGrid", () => {
  it("renders each release as a button with its name and year", () => {
    render(<VinylGrid albums={ALBUMS} />);
    const archetype = screen.getByRole("button", { name: /Archetype/ });
    expect(within(archetype).getByText("2025")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Night Drive/ })).toHaveTextContent("2021");
  });

  it("opens Spotify's player for the album on click", () => {
    render(<VinylGrid albums={ALBUMS} />);
    fireEvent.click(screen.getByRole("button", { name: /Archetype/ }));
    const iframe = player();
    expect(iframe).toHaveAttribute("src", "https://open.spotify.com/embed/album/alb1");
    expect(iframe.getAttribute("title")).toContain("Archetype");
  });

  it("opens with the keyboard too (Enter on the focused vinyl)", () => {
    render(<VinylGrid albums={ALBUMS} />);
    const button = screen.getByRole("button", { name: /Archetype/ });
    button.focus();
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.click(button); // un <button> nativo convierte Enter en click
    expect(player()).toBeInTheDocument();
  });

  it("closes with Esc and with the close button", () => {
    render(<VinylGrid albums={ALBUMS} />);
    fireEvent.click(screen.getByRole("button", { name: /Archetype/ }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(player()).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Archetype/ }));
    fireEvent.click(screen.getByRole("button", { name: i18n.t("about.close") }));
    expect(player()).not.toBeInTheDocument();
  });

  it("keeps only one album open at a time", () => {
    render(<VinylGrid albums={ALBUMS} />);
    fireEvent.click(screen.getByRole("button", { name: /Archetype/ }));
    fireEvent.click(screen.getByRole("button", { name: /Night Drive/ }));
    const iframes = screen.getAllByTitle(/Spotify/);
    expect(iframes).toHaveLength(1);
    expect(iframes[0]).toHaveAttribute("src", "https://open.spotify.com/embed/album/sgl1");
  });

  it("shows a placeholder for a release without a cover", () => {
    render(<VinylGrid albums={ALBUMS} />);
    const nightDrive = screen.getByRole("button", { name: /Night Drive/ });
    expect(within(nightDrive).queryByRole("img")).not.toBeInTheDocument();
    expect(within(nightDrive).getByText(i18n.t("about.noCover"))).toBeInTheDocument();
  });
});
