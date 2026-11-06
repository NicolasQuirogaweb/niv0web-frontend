# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This file starts with the September 2026 cleanup; earlier history is in `git log`.

## [Unreleased]

### Added
- Admin for sample packs: form with free or ARS/USD price and published switch, folders panel (add, rename, reorder, delete), required folder on every sample (single and batch) with move and filter by folder, and a ZIP panel to build the pack ZIP with stale and failure notices. Paid packs stay unpublished until the store exists. ADR 0007.
- Sample pack page at `/samplepacks/:slug`: cover, description, ZIP download (disabled with a notice when the pack has no ZIP yet or is paid) and the folder browser. `/samples` and `/samples/samplepack/:id` redirect to `/samplepacks`.
- Sample packs showcase uses the catalog console with a GRATIS or price tag, folders and samples count, and a generated cover on the record when a pack has no image.
- Beats and Loops show their catalogs like the home menu: a spinning record with the selected catalog on the label, the ring and scale around it, and the catalogs as 3D bars. ADR 0010.
- The NIVØ page as a documentary: background video with the name huge, the quote in big letters, the story in two columns that fades in, an announcement for the album Sentimientos restringidos (fills in with date, countdown, cover and pre-save as they exist) and the records in a crate that drop on a turntable. Picking a record starts it on Spotify. ADR 0009.
- Every section moves with the keyboard like the home menu: the arrows pick catalogs, licenses, tracks and records (to the nearest one in that direction), Enter opens or plays, Esc goes back. ADR 0008.
- FL Studio-style sample browser component: folders and samples as a keyboard-navigable tree (arrows, Home/End, Enter/Space) with a now-playing bar, no download control. Used by the sample pack page.

### Changed
- Both homes show the sections as a console-style menu: amber orb with pulsing sound bars that breathes, selectable bars with cut corners in a 3D perspective where the selected one comes forward with a light sweep, a ring of small bars and a turning scale around the orb, lines from the orb to each section with a spark and a flash when the selection changes, keyboard arrows and Enter from the moment the page opens, reduced-motion aware, stacked on phones. ADR 0005.
- One type system for the whole site: Bebas Neue (vintage gear screen printing, with worn ink on big titles and a slashed zero so niv0 doesn't read "nivo") for headings, buttons and interface labels, Inter for reading text. Arial and hardcoded fonts are gone. ADR 0006.

### Fixed
- Sample packs: a pack without a cover is saved with `imageUrl: null`; the ZIP panel explains an interrupted build when the failure has no message; "1 carpeta · 1 sample" (and "1 folder") read singular; the unused `getSamples` call to the removed `/api/resources/samples/playlist/:id` route and the `card.items_samples` strings are gone.
- On the About page the "niv0 beats" logo takes a logged-in visitor to the logged-in home instead of the public one.

### Removed
- The old per-pack samples page and the unused `CardPlaylist` component.

## 2026-11-04

### Added
- Background videos per section, ready to plug in: `PageBackground` (poster first, video after page load, 480p on phones, paused in hidden tabs, no video with reduced motion / data saver / slow connections) and `scripts/encode-background.sh`. Catalog background videos get the same treatment. ADR 0004.
- Background videos for home, Beats, Loops, Sample packs and Prod mix master (720p desktop, 480p phone, poster), served from B2 `backgrounds/` with hashed names and a one-year immutable cache.
- Background videos are muted and started explicitly, so autoplay no longer stalls on a frozen poster.
- `ui-component` skill for agents: how to build a component in the site's style.
- Public About me page (`/about`): story plus the discography from Spotify as a vinyl grid. Each release opens Spotify's embedded player so plays count on Spotify. Linked from both homes.
- Loading spinner on the play buttons while a track buffers.
- Beat catalogs say that the free download is an MP3 and the WAV comes with the license; trying to download a beat WAV explains that instead of failing.
- Playlist mode in beat and loop catalogs: a play-all button next to the title, auto-advance to the next track, stop after the last one.
- Tracks live in a scrollable box, so the whole page no longer scrolls on mobile.
- Lock-screen and notification controls on phones (Media Session API).
- The track that is playing is highlighted with an animated equalizer.

### Changed
- Accent color is now amber (#f5c26b); every color comes from `src/styles/tokens.css`.
- Beats page redesign: heading, catalogs, then licenses. Catalog cards (shared by beats, loops and sample packs) are glass cards with the blurred cover behind, the item count and an equalizer that moves on hover/focus. Licenses are three cards with price and what each includes, the exclusive one highlighted; until payments exist the button opens Instagram. The old hardcoded (and outdated) price text is gone.
- Design tokens in `src/styles/tokens.css` (ADR 0003). Public home links hover like the logged-in home, with the green accent instead of red.
- Beat catalogs are listen-only: no download button, and a note that beats are sold with a license (common, exclusive or exclusive + stems). Sample packs and loops keep their downloads.
- One `<audio>` element per page instead of one per track.
- Migrated from Create React App to Vite + Vitest. Production build ~33 s → ~1 s.
- Env vars renamed: `REACT_APP_BACKEND_URL` → `VITE_BACKEND_URL`, `REACT_APP_GOOGLE_CLIENT_ID` → `VITE_GOOGLE_CLIENT_ID`.
- ESLint 9 flat config. No more `--legacy-peer-deps`.

### Fixed
- Downloads felt frozen: the whole file was fetched into memory through the API before anything happened, and every extra tap started another download. Now the browser downloads straight from B2 through a signed link (starts in ~0.5 s, with the browser's progress bar), the button is disabled with a spinner and then shows ✓, and the file keeps its real extension (WAVs were being saved as `.mp3`).
- Changing tracks (including from the lock screen) was slow: the next track is now preloaded on a second audio element, and WAVs play their MP3 preview.
- Android: tapping "next" on the lock screen closed the media notification and stopped playback. Track changes now call `play()` synchronously inside the handler that triggered them, the session reports `playbackState` explicitly, and the notification gets a seek bar (`setPositionState`).
- A track that fails to load is skipped instead of stopping the catalog.

## 2026-09-30

Requires the backend from the same date (`/samplepacks` in lowercase, `itemsCount`, `?type=` on playlists, `beatPlaylists` on the dashboard).

### Fixed
- Editing a sample pack opened an empty form.
- The playlist page always fetched beats, so loop catalogs didn't open.
- `/beats` also listed loop catalogs.
- Dashboard: the "loop catalogs" card showed the number of loops.
- Home: logged-in users saw "log in". Loops had no link anywhere.

### Added
- `/loops` lists loop catalogs, the same way `/beats` does.
- A visible error when a download fails.
- Accessibility: keyboard seek bar, a real dialog for confirmations, `<html lang>` synced with the language.
- Tests: playlist page by type, sample pack edit, dashboard.

### Changed
- The admin panel loads on demand (lazy routes).
- Shared `PageHeader` and `TrackList` instead of blocks copied between pages.
- Node 22 in CI.

### Removed
- About 24 MB of images and videos that nothing referenced.
- Service worker registration: `service-worker.js` never existed.
- Source maps in production.
