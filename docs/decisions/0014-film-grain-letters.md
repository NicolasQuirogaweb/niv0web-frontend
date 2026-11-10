# 0014. Film grain on the letters

Date: 2026-11-09. Status: accepted.

## Context

The big titles already had worn ink (ADR 0006), but it was a still texture. Nicolás wanted the letters to feel analog, like the vinyl crackle but for the image: "granulado", a cinema look. A VHS glitch (tracking tears, red/blue split) was tried in a preview and rejected; he picked film grain at the middle of three intensities.

## Decision

- **Grain.** SVG filters in `index.html` (`film-grain-1` to `-4`) multiply each letter pixel by a noise value, so every speck ends up between 60% and 140% of its brightness: light and dark grain, only inside the letters. The home menu (`LowerThirdMenu.css`) alternates the four frames at 12 per second, like a projected reel.
- **Every section.** `src/styles/film.css` gives the same moving grain and the projector weave with its flicker (see below) to all headings (`h1`–`h6`) and the big display text that isn't a heading: the About quote and countdown, license prices and the sample browser's "now playing". Nicolás asked for it after seeing the home.
- **Replaces the worn ink.** On top of the worn ink of ADR 0006 the grain left the letters full of holes, so `#ink-worn` and `#ink-worn-soft` are gone; the grain is the texture now.
- **Buttons too, without neon.** The header log out and the "back to home" / "back" buttons carry the grain and weave. The back buttons lost their neon glow and hover zoom (thin border, amber fill on hover) and are styled once in `index.css`; `src/styles/backButton.test.js` keeps glow and per-page copies from coming back.
- **Not in the admin.** `AdminLayout` marks its wrapper with `data-admin` and the rule skips it: the admin is a tool, not a screen to look at.
- **Film print white and halation.** The big home title uses `--film-white` (`#f6f1e8`) and a soft warm glow, the halo film makes around bright areas. The active home link gets the same glow.
- **Gate weave and flicker.** The home menu, and every textured title in the other sections, moves under a pixel and its brightness dips 2–5%, stepped at 12 fps. All of them move in step, like one film frame. The keyframes (`film-weave`) live in `film.css`.
- **Reduced motion.** With `prefers-reduced-motion`, the grain stays still and the menu doesn't move.
- **Not on running text.** Descriptions and the story keep plain text: grain there hurts reading.

`src/styles/svgFilters.test.js` checks that every `url(#id)` in the CSS exists in `index.html` (a missing id makes the browser drop the filter silently), that the home and the rest of the sections use the moving grain, and that the admin is excluded.

## Consequences

- Filters repaint the textured letters 12 times per second. They are titles, a small share of each page; if a phone struggles, the first lever is to stop the grain animation on `pointer: coarse` (it stays, still).
- Changing the intensity means changing `k1`/`k2` in the filters (`k1 = 2a`, `k2 = 1 − a`, with `a = 0.4` now).
