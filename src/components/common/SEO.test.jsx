import { render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { SEO, SHARE_IMAGE } from "./SEO";

describe("SEO", () => {
  it("gives shared links a large preview image (WhatsApp, Instagram, X)", async () => {
    render(
      <HelmetProvider>
        <SEO title="Beats" description="desc" />
      </HelmetProvider>
    );
    expect(SHARE_IMAGE).toMatch(/^https:\/\//);
    await waitFor(() =>
      expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute("content", SHARE_IMAGE)
    );
    expect(document.head.querySelector('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  });
});
