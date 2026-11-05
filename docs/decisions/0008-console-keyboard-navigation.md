# 0008 — Console-style keyboard navigation on every section

**Status:** accepted · **Date:** 2026-11

## Context

The home menu moves with the arrows and opens with Enter, like a console (ADR 0005). Inside the sections that stopped: you had to Tab through the header and every card. Nicolás wanted the whole site to work the same way as the home.

## Decision

- **One hook, `useConsoleNav({ back })`** (`src/hooks/useConsoleNav.js`), used by every section page. Pages don't share selection code; they only mark what can be picked.
- **What can be picked is marked in the DOM:** `data-nav-item` on the element. If what has to be pressed is a button inside it, the item says which with `data-nav-press="<selector>"`.
  - Catalog and Spotify cards (`GlassCard`): the card itself.
  - Licenses: the card; Enter presses its button (`.license-cta`).
  - Tracks: the row; Enter presses its play button (`.audio-play-btn`).
  - Records on About: the record.
- **Keys**
  - The arrows work as soon as the page opens. The first press picks the first item; after that each arrow goes to the **nearest item in that direction** (measured on screen, so it works in grids of any width and from the catalogs down to the licenses). At an edge it stays put.
  - Enter presses the picked item. If the item already has focus, the browser does it, so it never fires twice.
  - Esc goes back: Beats, Loops and Prod mix master → logged-in home; a catalog → its list; About → home. On About, if a record is open, Esc closes it and stays (the record calls `preventDefault`, and the hook respects it).
  - The mouse and focus also pick, so Enter opens the last thing you pointed at, and the highlight stays on it, like on the home.
  - Left alone: text fields, the seek bar (`role="slider"`), and anything with Alt, Ctrl or ⌘ (Alt + ← is the browser's back).
- **Look:** the picked item gets `data-nav-active="true"` and the same styles as hover/focus (lift and amber glow on cards, the record slides out of its sleeve, an amber edge on tracks).
- **Sample packs** get it with the new pack showcase and browser (sample packs plan), not on the page that's about to be replaced.

## Consequences

- A new section only needs `useConsoleNav({ back })` and `data-nav-item` on what can be picked.
- The home menu keeps its own logic (it also drives the orb); both follow the same keys.
- Arrow keys no longer scroll these pages; the picked item scrolls into view instead.
- On phones nothing changes: there's no keyboard.
