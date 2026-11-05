# 0010 — Catalogs shown like the home menu

**Status:** accepted · **Date:** 2026-11

## Context

Beats and Loops listed their catalogs as a grid of glass cards (ADR 0003). After the home became a console-style menu (ADR 0005) the sections felt like a different site. Nicolás wanted a common thread. From three mockups (console, cover carousel, panel grid) he chose **console**.

All beat catalogs currently share the same generic speaker image, which also favoured a layout where the cover is small.

## Decision

- **`CatalogConsole`** (`src/components/common/CatalogConsole.jsx`) replaces the card grid on Beats and Loops.
  - Left, where the home has its orb: a spinning record whose label is the cover of the selected catalog, with the home's ring of small bars and turning scale around it, and the catalog name and count below.
  - Right: the catalogs as the home's 3D bars (cut corners, `rotateY(-22deg)`, the selected one comes forward, amber fill, light sweep), each with its count.
  - Always one selected, starting with the first. Mouse, focus and the arrows (`useConsoleNav`, ADR 0008) select; Enter or a click opens the catalog.
  - With many catalogs the list scrolls inside its own box, faded at the edges; the arrows bring the selected one into view. The list doesn't jump to follow the mouse, so hovering never makes it run away.
  - Medium screens: smaller record. Phones: record on top, flat list below. Reduced motion: no spinning, no sweep, nothing moves forward.
- **`OrbRing`** (`src/components/common/OrbRing.jsx`) is the ring and scale, shared by the home menu and the catalogs. Each container sets `--ring-r` and `--ticks-out`.
- **Sample packs** will use the same component for the pack showcase (with each pack's own cover on the record) when the sample packs plan is built; its pack card task follows this ADR instead of glass cards.

## Consequences

- `CardPlaylist` / `GlassCard` remain only on the current Sample packs page and Prod mix master.
- Licenses on Beats keep their cards below the catalogs.
