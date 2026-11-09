import { render, screen, fireEvent } from "@testing-library/react";
import i18n from "../../i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  afterEach(() => i18n.changeLanguage("es"));

  it("in Spanish, the EN button says it switches to English, in Spanish", () => {
    i18n.changeLanguage("es");
    render(<LanguageSwitcher />);
    const btn = screen.getByRole("button", { name: "Cambiar a inglés" });
    expect(btn).toHaveTextContent("EN");
    fireEvent.click(btn);
    expect(i18n.language).toBe("en");
  });

  it("in English, the ES button says it switches to Spanish, in English", () => {
    i18n.changeLanguage("en");
    render(<LanguageSwitcher />);
    expect(screen.getByRole("button", { name: "Switch to Spanish" })).toHaveTextContent("ES");
  });
});
