import i18n from "../i18n/config";
import { loginErrorKey } from "./Login";

describe("login error messages", () => {
  it("says the server could not be reached when there was no answer (offline, blocked, timeout)", () => {
    expect(loginErrorKey({ request: {}, message: "Network Error" })).toBe("login.errorNetwork");
    expect(loginErrorKey({ code: "ECONNABORTED" })).toBe("login.errorNetwork");
  });

  it("says to wait when there were too many attempts", () => {
    expect(loginErrorKey({ response: { status: 429 } })).toBe("login.errorRateLimit");
  });

  it("does not blame ad blockers when the server answered with an error", () => {
    expect(loginErrorKey({ response: { status: 400, data: { code: "VALIDATION_ERROR" } } })).toBe("login.errorServer");
    expect(loginErrorKey({ response: { status: 500 } })).toBe("login.errorServer");
  });

  it("has every message in both languages", () => {
    ["errorNetwork", "errorRateLimit", "errorServer", "errorGoogle"].forEach((key) =>
      ["es", "en"].forEach((lng) => expect(i18n.exists(`login.${key}`, { lng })).toBe(true))
    );
  });
});
