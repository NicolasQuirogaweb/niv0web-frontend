import { render, screen, fireEvent } from "@testing-library/react";
import i18n from "../../i18n/config";
import { LoadError, loadErrorKey } from "./LoadError";

describe("LoadError", () => {
  beforeEach(() => i18n.changeLanguage("es"));

  it("says what went wrong in the visitor's language, never the raw error", () => {
    expect(loadErrorKey({ message: "Network Error", request: {} })).toBe("loadError.network");
    expect(loadErrorKey({ response: { status: 404 } })).toBe("loadError.notFound");
    expect(loadErrorKey({ response: { status: 500 } })).toBe("loadError.server");
  });

  it("is announced and offers to try again", () => {
    const onRetry = vi.fn();
    render(<LoadError error={{ message: "Network Error" }} onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent(i18n.t("loadError.network"));
    expect(screen.queryByText(/Network Error/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: i18n.t("loadError.retry") }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("has every text in both languages", () => {
    ["network", "notFound", "server", "retry"].forEach((k) =>
      ["es", "en"].forEach((lng) => expect(i18n.exists(`loadError.${k}`, { lng })).toBe(true))
    );
  });
});
