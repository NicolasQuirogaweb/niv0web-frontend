import { render, screen, fireEvent, within } from "@testing-library/react";
import i18n from "../../i18n/config";
import { RecordCrate } from "./RecordCrate";

// El reproductor real carga un script de Spotify: acá solo importa qué disco recibe.
vi.mock("./SpotifyPlayer", () => ({
  SpotifyPlayer: ({ albumId }) => <div data-testid="spotify-player">{albumId}</div>,
}));

const ALBUMS = [
  {
    spotifyId: "alb1",
    name: "Archetype",
    releaseDate: "2025-08-01",
    imageUrl: "https://i.scdn.co/image/a",
    spotifyUrl: "https://open.spotify.com/album/alb1",
  },
  {
    spotifyId: "sgl1",
    name: "Night Drive",
    releaseDate: "2021",
    imageUrl: null,
    spotifyUrl: "https://open.spotify.com/album/sgl1",
  },
];

const record = (name) => screen.getByRole("button", { name: new RegExp(name) });
const deck = () => screen.getByRole("region", { name: i18n.t("about.turntable") });

describe("RecordCrate", () => {
  it("puts each release in the crate as a button with its name and year, ready for the arrows", () => {
    render(<RecordCrate albums={ALBUMS} />);
    expect(record("Archetype")).toHaveAccessibleName("Archetype 2025");
    expect(record("Night Drive")).toHaveAccessibleName("Night Drive 2021");
    expect(record("Archetype")).toHaveAttribute("data-nav-item");
  });

  it("the turntable waits for a record and nothing plays yet", () => {
    render(<RecordCrate albums={ALBUMS} />);
    expect(within(deck()).getByText(i18n.t("about.pickRecord"))).toBeInTheDocument();
    expect(screen.queryByTestId("spotify-player")).not.toBeInTheDocument();
  });

  it("picking a record puts it on the turntable and plays it on Spotify", () => {
    render(<RecordCrate albums={ALBUMS} />);
    fireEvent.click(record("Night Drive"));
    expect(record("Night Drive")).toHaveAttribute("aria-pressed", "true");
    expect(record("Archetype")).toHaveAttribute("aria-pressed", "false");
    expect(within(deck()).getByRole("heading", { name: "Night Drive" })).toBeInTheDocument();
    expect(screen.getByTestId("spotify-player")).toHaveTextContent("sgl1");
    expect(within(deck()).getByRole("link", { name: i18n.t("about.listenOnSpotify") })).toHaveAttribute(
      "href",
      "https://open.spotify.com/album/sgl1"
    );
  });

  it("a release without a cover still shows its name in the crate", () => {
    render(<RecordCrate albums={ALBUMS} />);
    expect(within(record("Night Drive")).getByText(i18n.t("about.noCover"))).toBeInTheDocument();
  });
});

describe("RecordCrate notes", () => {
  const NOTES = { alb1: { es: "Un disco nocturno.", en: "A night record." } };

  it("shows the chosen record's short story in the page language", () => {
    i18n.changeLanguage("es");
    render(<RecordCrate albums={ALBUMS} notes={NOTES} />);
    fireEvent.click(record("Archetype"));
    expect(within(deck()).getByText("Un disco nocturno.")).toBeInTheDocument();
    i18n.changeLanguage("en");
  });

  it("falls back to Spanish when there is no English text, and shows nothing for a record without notes", () => {
    i18n.changeLanguage("en");
    render(<RecordCrate albums={ALBUMS} notes={{ alb1: { es: "Solo en castellano." } }} />);
    fireEvent.click(record("Archetype"));
    expect(within(deck()).getByText("Solo en castellano.")).toBeInTheDocument();
    fireEvent.click(record("Night Drive"));
    expect(deck().querySelector(".deck-notes")).toBeNull();
  });
});
