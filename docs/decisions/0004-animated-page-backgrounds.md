# 0004 — Animated page backgrounds without hurting performance

**Status:** accepted · **Date:** 2026-11

## Context

Nicolás wants more movement in the logged-in pages: a background **video per section** (home, Beats, Loops, Sample packs, Prod mix master) instead of the current photo.

Before this change:
- The same photo was hardcoded as a CSS background in five stylesheets. CSS can't show a video.
- Catalogs could already have a background video from the admin. That video started downloading in full right away, with no placeholder, kept playing in hidden tabs, and ignored data saver and reduced motion.

## Decision

- **One component for every logged-in background: `PageBackground`.** Each page passes `{ poster, video?, videoMobile? }`:
  - Section backgrounds come from `src/content/backgrounds.js`. Changing a background means editing data, not code.
  - Catalogs use `catalogBackground()`, so a video or image uploaded from the admin gets the same behaviour. The old `BackgroundMedia` is removed.
- **Performance rules, enforced by `PageBackground` and covered by tests:**
  1. **Poster first.** The image paints immediately and stays as the `poster` while the video loads.
  2. **Video after the page.** The `<video>` element is created only after `window.load`, so it never competes with the page's own requests.
  3. **No video when it costs the viewer:**
     - `prefers-reduced-motion`;
     - `navigator.connection.saveData`;
     - `effectiveType` of `slow-2g`, `2g` or `3g`.
     Those viewers keep the still image.
  4. **Lighter file on phones.** At `max-width: 768px` it uses `videoMobile` (480p), and `video` (720p) everywhere else.
  5. **Paused when not visible.** It pauses on `visibilitychange` → hidden and resumes when the tab is visible again.
  6. **The video is decoration:** muted, looped, `playsinline`, `aria-hidden`, and the same dark shade on top as the photo had, so text stays readable.
- **Encoding is part of the process.** `scripts/encode-background.sh` turns any source video into what the rules assume:
  - 720p and 480p H.264, no audio track, `+faststart`, capped bitrate, 15 s by default;
  - plus a WebP poster.
  - Target: about 2–4 MB for desktop and about 1 MB for mobile.

## Consequences

- A section can get a video by encoding it, uploading the three files to B2 and pasting the URLs in `backgrounds.js`.
- Viewers on slow connections or with reduced motion never download the video.
- Five stylesheets no longer carry the background URL; sections sit on top (`position: relative; z-index: 1`) of the fixed background.
- B2 serves the files with its default caching. A CDN in front of B2 would help if traffic grows.
