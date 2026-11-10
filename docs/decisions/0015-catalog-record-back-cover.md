# 0015. Catalogs as a record's back cover

Date: 2026-11-10. Status: accepted. Replaces the look of ADR 0010; its behavior stays.

## Context

The catalog console (ADR 0010) was a spinning vinyl with the catalog cover as its label, next to a list of 3D bars. It came from the earlier Xbox-style home. The home now uses the lower-third menu (ADR 0011) and the film look (ADR 0014), and the console no longer matched. Every beat catalog also has the same placeholder image, so a design built on covers looked empty.

Nicolás looked at eight throwaway mockups with the real catalogs: a lower third over the video, film credits, a film strip, a vinyl with a lower third, a cinema marquee, a record's back cover, spines in a crate and film slates. He picked the back cover.

## Decision

- **`CatalogConsole` keeps its name, props and behavior** and changes its look, so Beats, Loops and Sample packs change together. The pages did not change except Sample packs dropping `renderLabelFallback`, since there is no label to fill.
- **A sheet of old paper** with "NIVØ BEATS" and the total at the top, then **side A and side B**. The catalogs are split in half and numbered like a tracklist (A1, A2… B1…). Each row has a dotted line and, at the end, the count, or the caller's badge (a pack's price or GRATIS) when there is one. A single catalog has no side B. On a phone the sides stack.
- **The chosen catalog** shows as an ink bar in the list and big at the bottom, with its letters rising and the line drawing in, like the home's lower third, in the sheet's print red. It is `aria-hidden`; screen readers use the list, whose links carry the full count.
- **Film look:** the sheet has the projector weave; the grain goes on the text only, because on light paper it filled the whole sheet with noise. Reduced motion keeps the grain still and the letters in place.
- **Arrows** are unchanged: rows carry `data-nav-item` for `useConsoleNav` (ADR 0008), and the two columns let ← → jump between sides.
- `OrbRing` had no other user and is deleted.

## Consequences

- Covers no longer show on the catalog pages. They still show inside each catalog.
- Paper, ink and print red are local to `CatalogConsole.css` (`--paper`, `--ink`, `--print-red`), not site tokens: they belong to this object only.
