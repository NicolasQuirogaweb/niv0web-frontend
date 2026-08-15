import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../i18n/config";
import { AdminRoute } from "./AdminRoute";
import { useAuth } from "../hooks/useAuth";

jest.mock("../hooks/useAuth", () => ({ useAuth: jest.fn() }));

const renderAdminRoute = () =>
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/admin" element={<AdminRoute><div>admin content</div></AdminRoute>} />
        <Route path="/home" element={<div>home page</div>} />
        <Route path="/homelogued" element={<div>homelogued page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("AdminRoute", () => {
  it("redirects unauthenticated users to /home", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false, loading: false });
    renderAdminRoute();
    expect(screen.getByText("home page")).toBeInTheDocument();
  });

  it("redirects authenticated non-admin users to /homelogued", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false, loading: false });
    renderAdminRoute();
    expect(screen.getByText("homelogued page")).toBeInTheDocument();
  });

  it("renders children for authenticated admin users", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true, loading: false });
    renderAdminRoute();
    expect(screen.getByText("admin content")).toBeInTheDocument();
  });
});
