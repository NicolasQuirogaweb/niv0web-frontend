import { render, screen, within } from "@testing-library/react";
import i18n from "../../i18n/config";
import { LicenseCards } from "./LicenseCards";
import { CONTACT_URL } from "../../content/contact";

const tier = (name) => screen.getByRole("article", { name });

describe("LicenseCards", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("shows the three licenses with their prices in pesos", () => {
    render(<LicenseCards />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(within(tier(i18n.t("licenses.common.name"))).getByText("$ 25.000")).toBeInTheDocument();
    expect(within(tier(i18n.t("licenses.exclusive.name"))).getByText("$ 80.000")).toBeInTheDocument();
    expect(within(tier(i18n.t("licenses.exclusiveStems.name"))).getByText("$ 200.000")).toBeInTheDocument();
  });

  it("highlights the exclusive license as the most chosen one", () => {
    render(<LicenseCards />);
    expect(within(tier(i18n.t("licenses.exclusive.name"))).getByText(i18n.t("licenses.featured"))).toBeInTheDocument();
    expect(within(tier(i18n.t("licenses.common.name"))).queryByText(i18n.t("licenses.featured"))).not.toBeInTheDocument();
  });

  it("says what each license includes and what it does not, also for screen readers", () => {
    render(<LicenseCards />);
    const common = tier(i18n.t("licenses.common.name"));
    expect(within(common).getByText(i18n.t("licenses.features.stems"))).toHaveAttribute("data-included", "false");
    expect(within(common).getByText(i18n.t("licenses.features.wav"))).toHaveAttribute("data-included", "true");
    expect(within(common).getAllByText(i18n.t("licenses.notIncluded")).length).toBeGreaterThan(0);

    const stems = tier(i18n.t("licenses.exclusiveStems.name"));
    expect(within(stems).getByText(i18n.t("licenses.features.stems"))).toHaveAttribute("data-included", "true");
  });

  it("until payments exist, each button opens Instagram to message niv0", () => {
    render(<LicenseCards />);
    const buttons = screen.getAllByRole("link", { name: new RegExp(i18n.t("licenses.contact")) });
    expect(buttons).toHaveLength(3);
    buttons.forEach((a) => {
      expect(a).toHaveAttribute("href", CONTACT_URL);
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
