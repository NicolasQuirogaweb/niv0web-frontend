import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../i18n/config";
import { PrivateRoute } from "./PrivateRoutes";
import { useAuth } from "../hooks/useAuth";

jest.mock("../hooks/useAuth", () => ({ useAuth: jest.fn() }));

const renderPrivateRoute = () =>
  render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/protected" element={<PrivateRoute><div>secret content</div></PrivateRoute>} />
        <Route path="/home" element={<div>home page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("PrivateRoute", () => {
  it("shows a loading indicator while auth state is resolving", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });
    renderPrivateRoute();
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
    expect(screen.queryByText("home page")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to /home", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    renderPrivateRoute();
    expect(screen.getByText("home page")).toBeInTheDocument();
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  it("renders children for authenticated users", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    renderPrivateRoute();
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });
});
