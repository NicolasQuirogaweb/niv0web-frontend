import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../i18n/config";
import { SamplePacks } from "./SamplePacks";
import { samplePacksService } from "../services/api";

vi.mock("../hooks/useAuth", () => ({ useLogout: () => vi.fn() }));
vi.mock("../services/api", () => ({
  samplePacksService: { getAll: vi.fn() },
}));

describe("SamplePacks showcase", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("lists packs on the record back cover with badge and meta, the chosen one featured", async () => {
    samplePacksService.getAll.mockResolvedValue({
      data: [{ _id: "p1", title: "Mastermind", slug: "mastermind", imageUrl: null, folderCount: 5, itemsCount: 247, isFree: true, priceArs: 0, priceUsd: null }],
    });
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <SamplePacks />
        </MemoryRouter>
      </HelmetProvider>
    );
    const link = await screen.findByRole("link", { name: /Mastermind/ });
    expect(link).toHaveAttribute("href", "/samplepacks/mastermind");
    expect(link).toHaveTextContent("GRATIS");
    expect(link).toHaveTextContent("5 carpetas · 247 samples");
    // Contratapa: el pack elegido aparece en grande abajo, con su precio.
    expect(container.querySelector(".sleeve-feature")).toHaveTextContent("Mastermind");
    expect(container.querySelector(".sleeve-feature")).toHaveTextContent("GRATIS");
  });

  const renderOne = async (folderCount, itemsCount) => {
    samplePacksService.getAll.mockResolvedValue({
      data: [{ _id: "p1", title: "Mastermind", slug: "mastermind", imageUrl: null, folderCount, itemsCount, isFree: true, priceArs: null, priceUsd: null }],
    });
    render(
      <HelmetProvider>
        <MemoryRouter>
          <SamplePacks />
        </MemoryRouter>
      </HelmetProvider>
    );
    return screen.findByRole("link", { name: /Mastermind/ });
  };

  it("reads singular for one folder and one sample in Spanish", async () => {
    const link = await renderOne(1, 1);
    expect(link).toHaveTextContent("1 carpeta · 1 sample");
    expect(link).not.toHaveTextContent("carpetas");
  });

  it("reads singular and plural in English", async () => {
    await i18n.changeLanguage("en");
    const link = await renderOne(1, 2);
    expect(link).toHaveTextContent("1 folder · 2 samples");
    expect(link).not.toHaveTextContent("folders");
  });
});
