import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import i18n from "../i18n/config";
import { Samples } from "./Samples";
import { samplePacksService } from "../services/api";

vi.mock("../hooks/useAuth", () => ({ useLogout: () => vi.fn() }));
vi.mock("../services/api", () => ({
  samplePacksService: { getSamples: vi.fn() },
  downloadService: { file: vi.fn() },
}));

describe("Samples page", () => {
  it("lists the samples in the scroll box without a play-all button", async () => {
    samplePacksService.getSamples.mockResolvedValue({
      data: { _id: "sp1", title: "Drum Kit", samples: [{ _id: "s1", title: "Kick 01", audioFile: "https://x/k.wav" }] },
    });

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/samples/samplepack/sp1"]}>
          <Routes>
            <Route path="/samples/samplepack/:samplepackId" element={<Samples />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(await screen.findByText("Kick 01")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: i18n.t("player.playAll") })).not.toBeInTheDocument();
  });
});
