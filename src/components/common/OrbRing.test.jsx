import { render, act } from "@testing-library/react";
import { OrbRing } from "./OrbRing";

let observed;
beforeEach(() => {
  observed = null;
  window.IntersectionObserver = class {
    constructor(cb) {
      this.cb = cb;
    }
    observe(el) {
      observed = { el, cb: this.cb };
    }
    disconnect() {}
  };
});
afterEach(() => {
  delete window.IntersectionObserver;
});

describe("OrbRing", () => {
  it("pauses its animations while it is off screen, and resumes when it comes back", () => {
    const { container } = render(<OrbRing />);
    const wrap = container.querySelector(".orb-wrap");
    expect(observed.el).toBe(wrap);
    act(() => observed.cb([{ isIntersecting: false }]));
    expect(wrap).toHaveAttribute("data-paused", "true");
    act(() => observed.cb([{ isIntersecting: true }]));
    expect(wrap).not.toHaveAttribute("data-paused");
  });

  it("still renders where IntersectionObserver doesn't exist", () => {
    delete window.IntersectionObserver;
    const { container } = render(<OrbRing />);
    expect(container.querySelectorAll(".orb-ring > i")).toHaveLength(64);
  });
});
