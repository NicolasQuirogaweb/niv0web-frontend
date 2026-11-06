import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../../i18n/config";
import { SamplePackPage } from "./SamplePackPage";
import { samplePacksService } from "../../services/api";

vi.mock("../../hooks/useAuth", () => ({ useLogout: () => vi.fn() }));
vi.mock("../../services/api", () => ({
  samplePacksService: { getBySlug: vi.fn() },
}));

const pack = (over = {}) => ({
  _id: "p1",
  title: "Mastermind",
  slug: "mastermind",
  description: "Un pack",
  imageUrl: null,
  folderCount: 1,
  itemsCount: 1,
  isFree: true,
  priceArs: 0,
  priceUsd: null,
  zip: { url: "https://cdn/x.zip", bytes: 143 * 1024 * 1024 },
  folders: [{ name: "Drums", samples: [{ _id: "a", title: "kick", audioFile: "https://cdn/a.mp3", durationSec: 2 }] }],
  ...over,
});

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/samplepacks/mastermind"]}>
        <Routes>
          <Route path="/samplepacks/:slug" element={<SamplePackPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe("SamplePackPage", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("free pack with zip links the download with its size", async () => {
    samplePacksService.getBySlug.mockResolvedValue({ data: pack() });
    renderPage();
    const link = await screen.findByRole("link", { name: /DESCARGAR ZIP/ });
    expect(link).toHaveAttribute("href", "https://cdn/x.zip");
    expect(link).toHaveAttribute("download");
    expect(link).toHaveAttribute("data-nav-item");
    expect(link).toHaveTextContent("143 MB");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mastermind");
  });

  it("zip without bytes shows only the download text", async () => {
    samplePacksService.getBySlug.mockResolvedValue({ data: pack({ zip: { url: "https://cdn/x.zip", bytes: null } }) });
    renderPage();
    const link = await screen.findByRole("link", { name: /DESCARGAR ZIP/ });
    expect(link).not.toHaveTextContent("MB");
  });

  it("free pack without zip shows a disabled pending button", async () => {
    samplePacksService.getBySlug.mockResolvedValue({ data: pack({ zip: null }) });
    renderPage();
    const btn = await screen.findByRole("button", { name: "ZIP en preparación" });
    expect(btn).toBeDisabled();
    expect(btn).not.toHaveAttribute("data-nav-item");
  });

  it("paid pack shows coming soon and the price", async () => {
    samplePacksService.getBySlug.mockResolvedValue({ data: pack({ isFree: false, priceArs: 5000, zip: null }) });
    renderPage();
    const btn = await screen.findByRole("button", { name: /Próximamente/ });
    expect(btn).toBeDisabled();
    expect(screen.getByText(/5\.000/)).toBeInTheDocument();
  });

  it("shows the English description in English and falls back to the Spanish one", async () => {
    await i18n.changeLanguage("en");
    samplePacksService.getBySlug.mockResolvedValue({ data: pack({ descriptionEn: "A pack" }) });
    const { unmount } = renderPage();
    expect(await screen.findByText("A pack")).toBeInTheDocument();
    expect(screen.queryByText("Un pack")).toBeNull();
    unmount();

    samplePacksService.getBySlug.mockResolvedValue({ data: pack({ descriptionEn: null }) });
    renderPage();
    expect(await screen.findByText("Un pack")).toBeInTheDocument();
  });

  it("keeps the Spanish description in Spanish", async () => {
    samplePacksService.getBySlug.mockResolvedValue({ data: pack({ descriptionEn: "A pack" }) });
    renderPage();
    expect(await screen.findByText("Un pack")).toBeInTheDocument();
    expect(screen.queryByText("A pack")).toBeNull();
  });

  it("passes the pack title and ZIP size to the browser", async () => {
    samplePacksService.getBySlug.mockResolvedValue({ data: pack() });
    renderPage();
    expect(await screen.findByText("1 carpeta · 1 sample · ZIP 143 MB")).toBeInTheDocument();
  });

  it("404 shows the not-found text and the back link", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    samplePacksService.getBySlug.mockRejectedValue({ response: { status: 404 } });
    renderPage();
    expect(await screen.findByText("Este pack no existe o no está disponible.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver a los packs" })).toHaveAttribute("href", "/samplepacks");
  });
});
