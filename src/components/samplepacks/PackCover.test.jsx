import { render, screen } from "@testing-library/react";
import { PackCover } from "./PackCover";

describe("PackCover", () => {
  it("renders the image when there is one", () => {
    render(<PackCover title="Mastermind" imageUrl="https://x/m.png" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://x/m.png");
  });

  it("renders a hidden generated cover with the title when there is no image", () => {
    const { container } = render(<PackCover title="Mastermind" imageUrl={null} />);
    const cover = container.querySelector(".pack-cover-generated");
    expect(cover).toHaveAttribute("aria-hidden", "true");
    expect(cover).toHaveTextContent("Mastermind");
    expect(container.querySelector("img")).toBeNull();
  });
});
