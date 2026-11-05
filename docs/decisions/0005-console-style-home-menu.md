# 0005 — Console-style section menu on both homes

**Status:** accepted · **Date:** 2026-11

## Context

Both homes listed the sections (Beats, Sample packs, Loops, NIV0, Prod mix master) as big words scattered across the page with fixed margins (`margin-left: 600px` and similar). Nicolás wanted something more ordered and with more character, inspired by the dashboard of a classic game console: a glowing orb on one side and a vertical list of selectable bars on the other. It's an inspiration, not a copy: niv0's amber, his name in the orb, no third-party logos or layout details.

The menu was picked from a mockup with three orbs (the name NIV0, a spinning vinyl, pulsing sound bars). He first chose the name, then after seeing it live switched to **the sound bars**: seven bars that pulse, each with its own height and tempo.

## Decision

- **One component, `ConsoleMenu`, used by both homes.** The section list lives in `src/content/sections.js` (`HOME_SECTIONS`), so the two homes can't drift apart.
- **Layout**
  - Desktop: amber orb with pulsing sound bars on the left; on the right, five bars with cut corners, each with a small dot joined to the orb by a thin curved line. The bars follow a gentle curve around the orb.
  - Around the orb: a quiet ring of 64 small bars that pulse like a round audio visualizer, and outside it a scale of marks (fine every 6°, thick every 30°) that turns slowly, like a synth knob. The lines start outside that scale and are measured on screen, so they follow the bars at any width.
  - Medium screens (769–1100px): smaller orb and less space, so the ring isn't cut.
  - Phones (`max-width: 768px`): smaller orb on top, full-width list below, no curve or lines.
- **Always one section selected**, like on a console. It starts on the first one. The mouse, keyboard focus or the ↑ ↓ arrows move the selection, the arrows wrap around, and Enter opens the section. The arrows and Enter work as soon as the page opens, without clicking or tabbing into the menu first; while a text field or another control has focus, the keys stay with it. The selected bar fills with amber. The state is exposed as `data-active` so tests check it without reading CSS.
- **Depth:** on desktop the list is turned in perspective (`rotateY(-22deg)`), like the console. The selected bar comes toward the viewer (`translateZ`), the others stay back at 55% opacity, and a light sweep crosses the bar each time it's selected. Nicolás picked this (option B) over slanted bars and a travelling selector. Phones keep the list flat, because a turned list doesn't fit the width.
- **The orb reacts to the menu:** when the selection changes, a spark runs along that section's line to its dot, the orb flashes, its bars jump, a wave leaves the orb, the ring lights up for a moment and the scale gives a tug. Nicolás picked the quiet version of a mix of two mockups (visualizer ring + reaction) over 3D orbits.
- **Motion:** the orb breathes, its bars pulse, the ring's bars pulse and the scale turns. With `prefers-reduced-motion` all of that stops: no light sweep, no spark or flash, and the selected bar doesn't move.
- **Accessibility:** the menu is a `<nav>` named by `home.menuLabel` and the sections are a list of real links. The orb and the dots are `aria-hidden`.
- **Type:** Orbitron (Google Fonts, weights 600 and 800, loaded in the same request as Inter) through the `--font-display` token. It's used only in this menu.
- **No sound.** We asked and kept it silent.

## Consequences

- The homes' old per-link CSS (fixed margins and hover sizes) is gone. The header, Instagram link, admin button, call to action and backgrounds don't change.
- Orbitron draws the zero with a slash, so the NIV0 bar reads "NIVØ". That's the font's console look. If it bothers, the orb can use another font.
- When niv0 has a logo, it can go inside the orb without touching the menu.
