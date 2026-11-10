# 0014. Film grain on the letters

Date: 2026-11-09. Status: accepted.

## Context

The big titles already had worn ink (ADR 0006), but it was a still texture. Nicolás wanted the letters to feel analog, like the vinyl crackle but for the image: "granulado", a cinema look. A VHS glitch (tracking tears, red/blue split) was tried in a preview and rejected; he picked film grain at the middle of three intensities.

## Decision

- **Grain.** SVG filters in `index.html` (`film-grain-1` to `-4`) multiply each letter pixel by a noise value, so every speck ends up between 60% and 140% of its brightness: light and dark grain, only inside the letters. The home menu (`LowerThirdMenu.css`) alternates the four frames at 12 per second, like a projected reel.
- **Titles elsewhere.** `h1` and `h2` use `film-grain-soft` (weaker, still), on top of the worn ink on `h1`.
- **Film print white and halation.** The big home title uses `--film-white` (`#f6f1e8`) and a soft warm glow, the halo film makes around bright areas. The active home link gets the same glow.
- **Gate weave and flicker.** The home menu moves under a pixel and its brightness dips 2–5%, stepped at 12 fps.
- **Reduced motion.** With `prefers-reduced-motion`, the grain stays still and the menu doesn't move.
- **Not on running text.** Descriptions and the story keep plain text: grain there hurts reading.

`src/styles/svgFilters.test.js` checks that every `url(#id)` in the CSS exists in `index.html`; a missing id makes the browser drop the filter silently.

## Consequences

- Filters repaint the menu letters 12 times per second. It's a small area; if a phone struggles, the first lever is to stop the grain animation on `pointer: coarse`.
- Changing the intensity means changing `k1`/`k2` in the filters (`k1 = 2a`, `k2 = 1 − a`, with `a = 0.4` now).
