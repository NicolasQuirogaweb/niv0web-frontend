# 0006 — Two typefaces: vintage-gear display for interface, Inter for reading

**Status:** accepted · **Date:** 2026-11 · **Revised:** 2026-11-05 (Orbitron → Bebas Neue)

## Context

The console-style home menu (ADR 0005) brought in Orbitron. Nicolás wanted the whole site to use the same type so nothing looks out of place. Before this, the site mixed Inter (body), Arial (About, playlists, cards, licenses) and the browser's default fonts in some buttons and inputs.

After seeing it on the whole site he found Orbitron too digital and asked for something more analog. From four mockups (studio tape labels, vintage gear screen printing, a 70s record label, Orbitron with a printed look) he chose **vintage gear screen printing**: tall, narrow capitals like the ones printed on the front of an amp or a drum machine, with the ink a little worn.

A display face is made for a few big words. Setting a long paragraph in it, like the About story or the license terms, tires the eye.

## Decision

Two typefaces, each with a fixed job, through two tokens in `src/styles/tokens.css`:

- **`--font-display` (Bebas Neue)** is for brand and interface:
  - every heading `h1`–`h6`, which covers page titles, the "niv0 beats" logo and section titles;
  - every `<button>`;
  - catalog card titles;
  - license prices, badges and buttons;
  - the homes' menu and call-to-action line.
- **`--font-body` (Inter)** is for text that is read in a row: the About story, license summaries and features, track names, notices, form fields.

`src/index.css` applies the rule globally (headings and buttons get `--font-display` at weight 400 with a little letter spacing, `body` and form fields get `--font-body`). Components only declare a font when an element that isn't a heading or button carries interface text (`.card-title`, `.license-price`, `.license-cta`, `.about-logo`). No component names a font directly.

Details of the vintage look:

- **Worn ink** (replaced by film grain in ADR 0014). Two SVG filters live once in `index.html`: `#ink-worn` (edges a little rough plus small gaps in the ink) on every `h1`, and `#ink-worn-soft` (rough edges only) on the home menu bars that aren't selected. Small text never gets the gaps, so it stays legible.
- **One weight.** Bebas Neue has a single weight, so `html` sets `font-synthesis: none`: a leftover `font-weight: 700` renders regular instead of a smeared fake bold.
- **The zero.** In Bebas Neue the zero and the O are the same shape, so "niv0" read "nivo". The `--font-display` stack starts with Red Hat Mono loaded with `text=0`, a subset that holds only the digit 0 with a slash. Every 0 in display text, the brand name and prices included, gets the slash; every other character falls through to Bebas Neue.
- Sizes went up where Orbitron was small (menu bars, card titles, badges, the homes' call to action), because Bebas Neue is narrow.

## Consequences

- Same rule on public pages, logged-in pages, login and admin, so no page looks different.
- Changing a typeface later means editing one token and the font link.
- Bebas Neue has no lowercase: display text always reads in capitals ("NIVØ BEATS").
- Prices show slashed zeros ("$ 80.ØØØ"), the same as with Orbitron.
- Fonts load in two Google Fonts requests (Inter + Bebas Neue, and the one-glyph zero) with `display=swap`. Text shows in a fallback font until they arrive.
