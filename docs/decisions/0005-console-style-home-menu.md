# 0005 — Console-style section menu on both homes

**Status:** accepted · **Date:** 2026-11

## Context

Both homes listed the sections (Beats, Sample packs, Loops, NIV0, Prod mix master) as big words scattered across the page with fixed margins (`margin-left: 600px` and similar). Nicolás wanted something more ordered and with more character, inspired by the dashboard of a classic game console: a glowing orb on one side and a vertical list of selectable bars on the other. It's an inspiration, not a copy: niv0's amber, his name in the orb, no third-party logos or layout details.

The menu was picked from a mockup with three orbs (the name NIV0, a spinning vinyl, pulsing sound bars). He chose **the name NIV0**.

## Decision

- **One component, `ConsoleMenu`, used by both homes.** The section list lives in `src/content/sections.js` (`HOME_SECTIONS`), so the two homes can't drift apart.
- **Layout**
  - Desktop: amber orb with "NIV0" on the left; on the right, five bars with cut corners, each with a small dot joined to the orb by a thin line. The bars follow a gentle curve around the orb.
  - Phones (`max-width: 768px`): smaller orb on top, full-width list below, no curve or lines.
- **Always one section selected**, like on a console. It starts on the first one. The mouse, keyboard focus or the ↑ ↓ arrows move the selection, the arrows wrap around, and Enter opens the section. The selected bar fills with amber. The state is exposed as `data-active` so tests check it without reading CSS.
- **Motion:** the orb breathes and a ring turns around it. With `prefers-reduced-motion` both stop and the selected bar doesn't shift.
- **Accessibility:** the menu is a `<nav>` named by `home.menuLabel` and the sections are a list of real links. The orb and the dots are `aria-hidden`.
- **Type:** Orbitron (Google Fonts, weights 600 and 800, loaded in the same request as Inter) through the `--font-display` token. It's used only in this menu.
- **No sound.** We asked and kept it silent.

## Consequences

- The homes' old per-link CSS (fixed margins and hover sizes) is gone. The header, Instagram link, admin button, call to action and backgrounds don't change.
- Orbitron draws the zero with a slash, so the orb and the NIV0 bar read "NIVØ". That's the font's console look. If it bothers, the orb can use another font.
- When niv0 has a logo, it can replace the word inside the orb without touching the menu.
