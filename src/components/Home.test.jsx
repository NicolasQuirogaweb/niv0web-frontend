import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../i18n/config";
import { Home } from "./Home";
import { HomeLogued } from "./HomeLogued";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, userEmail: "a@b.com", isAdmin: false }),
  useLogout: () => vi.fn(),
}));

const renderPage = (page) =>
  render(
    <HelmetProvider>
      <MemoryRouter>{page}</MemoryRouter>
    </HelmetProvider>
  );

describe("links to About", () => {
  it("the public home links to /about", () => {
    renderPage(<Home />);
    expect(screen.getByRole("link", { name: i18n.t("home.about") })).toHaveAttribute("href", "/about");
  });

  it("the logged-in home links to /about", () => {
    renderPage(<HomeLogued />);
    expect(screen.getByRole("link", { name: i18n.t("home.about") })).toHaveAttribute("href", "/about");
  });
});

describe("the console menu", () => {
  it.each([["public", <Home key="h" />], ["logged-in", <HomeLogued key="l" />]])("is on the %s home", (_label, page) => {
    renderPage(page);
    const nav = screen.getByRole("navigation", { name: i18n.t("home.menuLabel") });
    expect(nav.querySelectorAll("a")).toHaveLength(5);
  });
});
