# 0006 — Two typefaces: console for interface, Inter for reading

**Status:** accepted · **Date:** 2026-11

## Context

The console-style home menu (ADR 0005) brought in Orbitron. Nicolás wanted the whole site to use the same type so nothing looks out of place. Before this, the site mixed Inter (body), Arial (About, playlists, cards, licenses) and the browser's default fonts in some buttons and inputs.

Orbitron is wide and made for a few big words. Setting a long paragraph in it, like the About story or the license terms, tires the eye, and on a phone only a handful of words fit per line.

## Decision

Two typefaces, each with a fixed job, through two tokens in `src/styles/tokens.css`:

- **`--font-display` (Orbitron)** is for brand and interface:
  - every heading `h1`–`h6`, which covers page titles, the "niv0 beats" logo and section titles;
  - every `<button>`;
  - catalog card titles;
  - license prices, badges and buttons;
  - the homes' menu and call-to-action line.
- **`--font-body` (Inter)** is for text that is read in a row: the About story, license summaries and features, track names, notices, form fields.

`src/index.css` applies the rule globally (headings and buttons get `--font-display`, `body` and form fields get `--font-body`). Components only declare a font when an element that isn't a heading or button carries interface text (`.card-title`, `.license-price`, `.license-cta`, `.about-logo`). No component names a font directly: Arial and hardcoded `"Inter"` are gone.

## Consequences

- Same rule on public pages, logged-in pages, login and admin, so no page looks different.
- Changing a typeface later means editing one token.
- Orbitron draws zero with a slash ("niv0" reads "nivØ" in headings). That's part of the console look.
- Fonts load in one Google Fonts request (Inter + Orbitron 600/800) with `display=swap`. Text shows in a fallback font until they arrive.
