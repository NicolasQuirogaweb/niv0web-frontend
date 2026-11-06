import { render, screen } from "@testing-library/react";
import { MyRoutes } from "./MyRoutes";

vi.mock("../context/AuthContext", () => ({ AuthProvider: ({ children }) => children }));
vi.mock("./PrivateRoutes", () => ({ PrivateRoute: ({ children }) => children }));
vi.mock("../components/SamplePacks", () => ({ SamplePacks: () => <p>showcase</p> }));
vi.mock("../components/samplepacks/SamplePackPage", () => ({ SamplePackPage: () => <p>pack page</p> }));

describe("MyRoutes sample routes", () => {
  it.each(["/samples", "/samples/samplepack/abc"])("%s redirects to the showcase", async (path) => {
    window.history.pushState({}, "", path);
    render(<MyRoutes />);
    expect(await screen.findByText("showcase")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/samplepacks");
  });

  it("/samplepacks/:slug renders the pack page", async () => {
    window.history.pushState({}, "", "/samplepacks/mastermind");
    render(<MyRoutes />);
    expect(await screen.findByText("pack page")).toBeInTheDocument();
  });
});
