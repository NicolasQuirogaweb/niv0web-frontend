import { render, screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../i18n/config";
import { Beats } from "./Beats";
import { beatsService } from "../services/api";

vi.mock("../hooks/useAuth", () => ({ useLogout: () => vi.fn() }));
vi.mock("../services/api", () => ({ beatsService: { getAll: vi.fn() } }));

const renderBeats = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Beats />
      </MemoryRouter>
    </HelmetProvider>
  );

describe("Beats page", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("reads top to bottom: heading, catalogs, then licenses", async () => {
    beatsService.getAll.mockResolvedValue({
      data: [
        { _id: "p1", title: "Archetype", imageUrl: "a", itemsCount: 9 },
        { _id: "p2", title: "Summer", imageUrl: "b", itemsCount: 12 },
      ],
    });
    renderBeats();

    const h1 = screen.getByRole("heading", { level: 1, name: i18n.t("beatsPage.title") });
    const catalogs = await screen.findByRole("region", { name: i18n.t("beatsPage.catalogs") });
    const licenses = screen.getByRole("region", { name: i18n.t("licenses.title") });

    expect(within(catalogs).getAllByRole("link")).toHaveLength(2);
    expect(within(licenses).getAllByRole("article")).toHaveLength(3);
    // El orden en el documento es el de la disposición elegida.
    expect(h1.compareDocumentPosition(catalogs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(catalogs.compareDocumentPosition(licenses) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("still shows the licenses when there are no catalogs", async () => {
    beatsService.getAll.mockResolvedValue({ data: [] });
    renderBeats();
    expect(await screen.findByText(i18n.t("beats.none"))).toBeInTheDocument();
    expect(screen.getByRole("region", { name: i18n.t("licenses.title") })).toBeInTheDocument();
  });

  it("Esc goes back to the home", async () => {
    beatsService.getAll.mockResolvedValue({ data: [] });
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/beats"]}>
          <Routes>
            <Route path="/beats" element={<Beats />} />
            <Route path="/homelogued" element={<p>logged home</p>} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    await screen.findByText(i18n.t("beats.none"));
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.getByText("logged home")).toBeInTheDocument();
  });
});
