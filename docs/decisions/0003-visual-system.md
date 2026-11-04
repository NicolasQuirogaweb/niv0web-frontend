# 0003: niv0's visual system (tokens, glass and motion)

**Status:** accepted · **Date:** 2026-11

## Context

The site grew one page at a time, and every CSS file brought its own values. The green accent `#bbf0be` is hardcoded in about ten files, together with slightly different shadows, radii and timings. The public home even used a different accent (a red, `#f59999`) that made its links look disabled.

The Beats page redesign was the moment to fix this. Nicolás chose the direction, based on BeatStars and mockups he could click:
- **Catalog cards: glass + equalizer.** The blurred cover fills the background, the sharp cover sits in front, and a glass panel holds the title and track count. A small equalizer moves on hover or focus.
- **Licenses: three cards side by side**, with the exclusive one highlighted as "most chosen" and the price as the main element.
- **Page order:** heading, catalogs, then licenses ("you listen first, then see how to buy").

## Decision

- **Design tokens.** Colors, glass, radii, shadows, motion and font are CSS custom properties in `src/styles/tokens.css`, imported once from `index.css`. New components use only tokens. Old stylesheets move to tokens when someone touches them, not in a big-bang rewrite.
- **The house style:**
  - Dark background, green accent, glass panels (`--glass-bg`, `--glass-border`, `--glass-blur`).
  - Hover means lift + glow, never color alone.
  - Motion uses `--ease-out` and `--dur-*`.
- **Accessibility is part of the style, not an extra:**
  - Every hover effect also applies on `:focus-visible`.
  - Every animation has a `prefers-reduced-motion` fallback.
  - Decorative elements get `aria-hidden`.
  - Status shown with a symbol (✓/✕) also gets text for screen readers.
- **Content as data.** What the license cards show (prices, which features each license includes) lives in `src/content/licenses.js`; the words live in i18n. When payments arrive (store design, stage 2), the prices come from the API and the component doesn't change.
- **A skill for agents.** `.claude/skills/ui-component` writes down how to build a component in this style, so an AI agent (or a person) doesn't reinvent values or forget focus and reduced motion.

## Consequences

- The redesigned card (`CardPlaylist`) is shared by beats, loops and sample packs, so all catalogs look the same.
- The old text block with hardcoded, outdated license prices is gone. Prices are defined in a single place.
- Some stylesheets still use raw values until they are migrated.
- Visual changes aren't covered by tests beyond structure and accessibility. The check is a manual pass on desktop and mobile view, listed in the skill.
