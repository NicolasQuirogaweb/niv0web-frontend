import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../i18n/config";
import { About } from "./About";
import { discographyService } from "../services/api";
import { AuthContext } from "../context/AuthContext";

vi.mock("../services/api", () => ({
  discographyService: { getAll: vi.fn() },
}));

// Sin AuthProvider a propósito: About es pública y no puede depender de la sesión.
const renderAbout = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <About />
      </MemoryRouter>
    </HelmetProvider>
  );

describe("About page", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("shows the title and the story without a logged-in user", async () => {
    discographyService.getAll.mockResolvedValue({ data: [] });
    renderAbout();
    expect(screen.getByRole("heading", { level: 1, name: i18n.t("about.title") })).toBeInTheDocument();
    const story = i18n.t("about.story", { returnObjects: true });
    expect(await screen.findByText(story[0])).toBeInTheDocument();
  });

  it("hides the discography when there are no releases", async () => {
    discographyService.getAll.mockResolvedValue({ data: [] });
    renderAbout();
    await screen.findByText(i18n.t("about.story", { returnObjects: true })[0]);
    await Promise.resolve();
    expect(screen.queryByRole("heading", { name: i18n.t("about.discography") })).not.toBeInTheDocument();
  });

  it("opens with the name over the video and where niv0 is from, without the genres", async () => {
    discographyService.getAll.mockResolvedValue({ data: [] });
    const { container } = renderAbout();
    const hero = screen.getByRole("banner", { name: i18n.t("about.title") });
    expect(hero).toContainElement(screen.getByRole("heading", { level: 1 }));
    expect(hero).toHaveTextContent(i18n.t("about.kicker"));
    expect(hero).not.toHaveTextContent(/hip hop alternativo/i);
    expect(container.querySelector(".page-bg--contained")).toBeInTheDocument();
    await screen.findByText(i18n.t("about.story", { returnObjects: true })[0]);
  });

  it("shows only the biography: no big quote", async () => {
    discographyService.getAll.mockResolvedValue({ data: [] });
    const { container } = renderAbout();
    await screen.findByText(i18n.t("about.story", { returnObjects: true })[0]);
    expect(screen.queryByRole("figure")).toBeNull();
    expect(container.querySelector(".about-quote")).toBeNull();
  });

  // Los párrafos aparecen al llegar a la pantalla. Al cambiar el idioma se montaban
  // párrafos nuevos que nadie miraba y quedaban invisibles.
  it("after switching language, the new paragraphs still appear", async () => {
    const observed = new Set();
    const original = window.IntersectionObserver;
    window.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; }
      observe(el) { observed.add(el); this.cb([{ isIntersecting: true, target: el }]); }
      unobserve() {}
      disconnect() {}
    };
    try {
      discographyService.getAll.mockResolvedValue({ data: [] });
      const { container } = renderAbout();
      await screen.findByText(i18n.t("about.story", { returnObjects: true })[0]);
      await act(async () => { await i18n.changeLanguage("en"); });
      const hidden = [...container.querySelectorAll(".reveal")].filter((el) => !el.classList.contains("is-in"));
      expect(hidden).toEqual([]);
    } finally {
      window.IntersectionObserver = original;
      await act(async () => { await i18n.changeLanguage("es"); });
    }
  });

  it("the story ends at INSPIRAR", async () => {
    discographyService.getAll.mockResolvedValue({ data: [] });
    renderAbout();
    const story = i18n.t("about.story", { returnObjects: true });
    expect(story[story.length - 1]).toBe(
      "Para él, la música se hace con el corazón y no con la cabeza: todo se trata de transmitir y, sobre todo, de INSPIRAR."
    );
    expect(await screen.findByText(story[story.length - 1])).toBeInTheDocument();
  });

  it("announces the new album Sentimientos restringidos", async () => {
    discographyService.getAll.mockResolvedValue({ data: [] });
    renderAbout();
    expect(screen.getByRole("heading", { name: "Sentimientos restringidos" })).toBeInTheDocument();
    await screen.findByText(i18n.t("about.story", { returnObjects: true })[0]);
  });

  it("shows the record crate when there are releases", async () => {
    discographyService.getAll.mockResolvedValue({
      data: [{ spotifyId: "alb1", name: "Archetype", type: "album", releaseDate: "2025-08-01", imageUrl: null, spotifyUrl: "x", totalTracks: 9 }],
    });
    renderAbout();
    expect(await screen.findByRole("heading", { name: i18n.t("about.discography") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Archetype/ })).toBeInTheDocument();
  });

  it("still shows the story if the discography request fails", async () => {
    discographyService.getAll.mockRejectedValue(new Error("network"));
    renderAbout();
    expect(await screen.findByText(i18n.t("about.story", { returnObjects: true })[0])).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: i18n.t("about.discography") })).not.toBeInTheDocument();
  });

  it("the logo goes to the public home for visitors", async () => {
    discographyService.getAll.mockResolvedValue({ data: [] });
    renderAbout();
    expect(screen.getByRole("link", { name: i18n.t("nav.niv0Beats") })).toHaveAttribute("href", "/home");
    await screen.findByText(i18n.t("about.story", { returnObjects: true })[0]);
  });

  it("the logo goes to the logged-in home when there is a session", async () => {
    discographyService.getAll.mockResolvedValue({ data: [] });
    render(
      <HelmetProvider>
        <AuthContext.Provider value={{ isAuthenticated: true }}>
          <MemoryRouter>
            <About />
          </MemoryRouter>
        </AuthContext.Provider>
      </HelmetProvider>
    );
    expect(screen.getByRole("link", { name: i18n.t("nav.niv0Beats") })).toHaveAttribute("href", "/homelogued");
    await screen.findByText(i18n.t("about.story", { returnObjects: true })[0]);
  });
});
