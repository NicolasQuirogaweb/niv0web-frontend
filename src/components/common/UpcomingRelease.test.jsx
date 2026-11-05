import { render, screen, act } from "@testing-library/react";
import i18n from "../../i18n/config";
import { UpcomingRelease } from "./UpcomingRelease";

const NOW = new Date("2026-11-10T12:00:00-03:00");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  i18n.changeLanguage("es");
});
afterEach(() => vi.useRealTimers());

describe("UpcomingRelease", () => {
  it("announces the album with only the month while there is no date, cover or link yet", () => {
    render(<UpcomingRelease release={{ title: "Sentimientos restringidos", month: "2026-11" }} />);
    expect(screen.getByRole("region", { name: i18n.t("about.upcoming.kicker") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sentimientos restringidos" })).toBeInTheDocument();
    expect(screen.getByText(i18n.t("about.upcoming.inMonth", { month: "noviembre" }))).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("with a date it says the day and counts down", () => {
    render(
      <UpcomingRelease release={{ title: "Sentimientos restringidos", month: "2026-11", releaseDate: "2026-11-21T00:00:00-03:00" }} />
    );
    expect(screen.getByText(i18n.t("about.upcoming.onDate", { date: "21 de noviembre" }))).toBeInTheDocument();
    const timer = screen.getByRole("timer");
    expect(timer).toHaveTextContent(/10\s*d/);
    expect(timer).toHaveTextContent(/12\s*h/);
    act(() => vi.advanceTimersByTime(60 * 60 * 1000));
    expect(timer).toHaveTextContent(/11\s*h/);
  });

  it("shows the cover and the pre-save button when they exist", () => {
    render(
      <UpcomingRelease
        release={{ title: "Sentimientos restringidos", month: "2026-11", coverUrl: "https://x/cover.webp", presaveUrl: "https://presave.example" }}
      />
    );
    expect(screen.getByRole("img", { name: "Sentimientos restringidos" })).toHaveAttribute("src", "https://x/cover.webp");
    const presave = screen.getByRole("link", { name: i18n.t("about.upcoming.presave") });
    expect(presave).toHaveAttribute("href", "https://presave.example");
    expect(presave).toHaveAttribute("target", "_blank");
  });

  it("disappears once the album is out (then it shows up in the discography)", () => {
    const { container } = render(
      <UpcomingRelease release={{ title: "Sentimientos restringidos", month: "2026-11", releaseDate: "2026-11-01T00:00:00-03:00" }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("without a release there is nothing to announce", () => {
    const { container } = render(<UpcomingRelease release={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
