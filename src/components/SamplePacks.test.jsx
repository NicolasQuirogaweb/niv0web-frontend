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

  it("lists packs on the catalog console with badge, meta and generated cover", async () => {
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
    const cover = container.querySelector(".catalog-record-label .pack-cover-generated");
    expect(cover).toHaveTextContent("Mastermind");
  });
});
