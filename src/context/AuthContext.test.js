import { render, screen, act, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, AuthProvider } from "./AuthContext";
import { authService, setUnauthorizedHandler } from "../services/api";

jest.mock("../services/api", () => ({
  authService: { verifyToken: jest.fn() },
  setUnauthorizedHandler: jest.fn(),
}));

const Consumer = () => {
  const auth = useContext(AuthContext);
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="isAdmin">{String(auth.isAdmin)}</span>
      <span data-testid="userEmail">{auth.userEmail || ""}</span>
      <button onClick={() => auth.saveAuth("user@test.com", "admin")}>save</button>
      <button onClick={() => auth.clearAuth()}>clear</button>
    </div>
  );
};

const renderAuthProvider = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </MemoryRouter>
  );

describe("AuthContext", () => {
  beforeEach(() => {
    jest.spyOn(window.localStorage.__proto__, "setItem");
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.localStorage.setItem.mockRestore?.();
  });

  it("calls verifyToken on mount even with no prior session", async () => {
    authService.verifyToken.mockRejectedValue(new Error("no session"));
    renderAuthProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    expect(authService.verifyToken).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
  });

  it("saveAuth updates state and never writes to localStorage", async () => {
    authService.verifyToken.mockRejectedValue(new Error("no session"));
    renderAuthProvider();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    act(() => {
      screen.getByText("save").click();
    });

    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("isAdmin")).toHaveTextContent("true");
    expect(screen.getByTestId("userEmail")).toHaveTextContent("user@test.com");
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith("authToken", expect.anything());
  });

  it("clearAuth resets state", async () => {
    authService.verifyToken.mockRejectedValue(new Error("no session"));
    renderAuthProvider();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    act(() => screen.getByText("save").click());
    act(() => screen.getByText("clear").click());

    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("isAdmin")).toHaveTextContent("false");
    expect(screen.getByTestId("userEmail")).toHaveTextContent("");
  });

  it("restores session on mount when verifyToken succeeds via the cookie", async () => {
    authService.verifyToken.mockResolvedValue({ data: { email: "stored@test.com", role: "user" } });

    renderAuthProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("userEmail")).toHaveTextContent("stored@test.com");
  });

  it("registers an unauthorized handler that clears auth and redirects to /login", async () => {
    authService.verifyToken.mockResolvedValue({ data: { email: "user@test.com", role: "user" } });
    renderAuthProvider();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    expect(setUnauthorizedHandler).toHaveBeenCalledWith(expect.any(Function));

    const handler = setUnauthorizedHandler.mock.calls[0][0];
    act(() => handler());

    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
  });
});
