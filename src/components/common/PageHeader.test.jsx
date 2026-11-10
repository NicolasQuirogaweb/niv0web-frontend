import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import "../../i18n/config";
import { PageHeader } from "./PageHeader";

const logout = vi.fn();
vi.mock("../../hooks/useAuth", () => ({ useLogout: () => logout }));

const here = dirname(fileURLToPath(import.meta.url));

describe("PageHeader", () => {
  it("logs out from the header button", () => {
    render(
      <MemoryRouter>
        <PageHeader />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(logout).toHaveBeenCalled();
  });

  // Beats, Sample packs, Loops, Prod Mix Master: el "cerrar sesión" tiene que verse
  // igual que en el home (letra de display, subrayado al pasar, grano de película).
  it("styles the log out button with the shared class, not the old monospace inline style", () => {
    render(
      <MemoryRouter>
        <PageHeader />
      </MemoryRouter>
    );
    const btn = screen.getByRole("button", { name: "Cerrar sesión" });
    expect(btn).toHaveClass("header-logout");
    expect(btn.getAttribute("style")).toBeNull();
  });

  it("the log out button carries the film grain like every display text", () => {
    const film = readFileSync(join(here, "../../styles/film.css"), "utf8");
    expect(film).toContain(".header-logout");
  });
});
