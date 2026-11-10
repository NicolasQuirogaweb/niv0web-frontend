# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This file starts with the September 2026 cleanup; earlier history is in `git log`.

## [Unreleased]

### Added
- Film look on the letters: moving film grain (12 frames per second) on every section's titles and big display text (headings, record label names, license prices, the About quote and countdown, the sample browser's now playing); the same text, and the home menu, get a sub-pixel projector weave with a faint flicker; the home menu also gets a warm film-print white with a soft halo. The grain replaces the worn ink on `h1`. The "log out" button in the header of Beats, Sample packs, Loops, playlists and Prod Mix Master now looks like the home one (display font, underline on hover, film grain) instead of monospace. The admin is left out. Reduced motion keeps the grain still. See ADR 0014.
- Sentry error reporting in production: crashes caught by the error screen (with the React component stack) and uncaught errors go to the `niv0-frontend` project, without personal data or performance traces. The SDK loads after the first render, in its own chunk, and only when `VITE_SENTRY_DSN` is set. See ADR 0013.
- Page color picker next to the language button, styled like a DAW preferences window: six colors (amber, red, magenta, cyan, mint, lime) and a fader for any hue. The whole site changes on the spot and the choice is remembered for the next visit. Arrows, Esc and clicking outside work. ADR 0012.
- Admin for sample packs: form with free or ARS/USD price and published switch, folders panel (add, rename, reorder, delete), required folder on every sample (single and batch) with move and filter by folder, and a ZIP panel to build the pack ZIP with stale and failure notices. Paid packs stay unpublished until the store exists. ADR 0007.
- Sample pack page at `/samplepacks/:slug`: cover, description, ZIP download (disabled with a notice when the pack has no ZIP yet or is paid) and the folder browser. `/samples` and `/samples/samplepack/:id` redirect to `/samplepacks`.
- Sample packs showcase uses the catalog console with a GRATIS or price tag, folders and samples count, and a generated cover on the record when a pack has no image.
- Beats and Loops show their catalogs like the home menu: a spinning record with the selected catalog on the label, the ring and scale around it, and the catalogs as 3D bars. ADR 0010.
- The NIVØ page as a documentary: background video with the name huge, the quote in big letters, the story in two columns that fades in, an announcement for the album Sentimientos restringidos (fills in with date, countdown, cover and pre-save as they exist) and the records in a crate that drop on a turntable. Picking a record starts it on Spotify. ADR 0009.
- Every section moves with the keyboard like the home menu: the arrows pick catalogs, licenses, tracks and records (to the nearest one in that direction), Enter opens or plays, Esc goes back. ADR 0008.
- FL Studio-style sample browser component: folders and samples as a keyboard-navigable tree (arrows, Home/End, Enter/Space) with a now-playing bar, no download control. Used by the sample pack page.
- Sample pack browser redesigned as an "FL PRO" window: title bar with lights and folders · samples · ZIP size, a screen with the path (pack / folder / sample), the selected name big, its sample count or duration and format, and a waveform per sample that fills amber while it plays; a search box (accent and case insensitive, Esc clears it without leaving the page); folder rows with chevron, folder icon and count, numbered sample rows with hover mini-waveform, zebra stripes and an EQ on the one playing; keyboard hints in the footer. ADR 0007.
- Optional English description for sample packs ("Descripción (inglés)" in the admin form, sent as `descriptionEn`); the pack page and its SEO description use it in English and fall back to the Spanish one.

### Changed
- Prod Mix Master shows the playlist of tracks niv0 produced, mixed and mastered inside the page with Spotify's player (the tracklist is visible and plays count on Spotify), with a "work on your track" button to his Instagram and an "Open in Spotify" link, instead of a card that only linked out. New title and texts in both languages; the unused old styles are gone.
- Both homes show the sections as the lower third of a music video, bottom-left so the background video stays free: the selected section huge with its letters rising, an amber line with a short subtitle, and the five sections in a numbered row below. Arrows (↑ ↓ ← →) and Enter work from the moment the page opens; reduced-motion aware. Replaces the console-style orb menu below. ADR 0011.
- Both homes show the sections as a console-style menu: amber orb with pulsing sound bars that breathes, selectable bars with cut corners in a 3D perspective where the selected one comes forward with a light sweep, a ring of small bars and a turning scale around the orb, lines from the orb to each section with a spark and a flash when the selection changes, keyboard arrows and Enter from the moment the page opens, reduced-motion aware, stacked on phones. ADR 0005.
- One type system for the whole site: Bebas Neue (vintage gear screen printing, with worn ink on big titles and a slashed zero so niv0 doesn't read "nivo") for headings, buttons and interface labels, Inter for reading text. Arial and hardcoded fonts are gone. ADR 0006.

### Fixed
- Design review (Vercel interface guidelines + animation guide), visitor bugs:
  - Enter presses the control that has focus (language, color, a link) instead of the record or catalog the mouse picked before.
  - The home menu leaves browser shortcuts alone (Alt + ← goes back) and keys another widget already used.
  - The language button says what it does in the current language ("Cambiar a inglés" / "Switch to Spanish"); it said the opposite in Spanish.
  - The NIVØ record crate no longer flickers on hover: hovering only lifts the record; picking it (keyboard or click) opens space.
  - Header links and the logout button no longer grow on hover and push the language and color buttons; they glow and underline, and show the same on keyboard focus.
  - Login on phones: the card fits the Google button; the error and "Ingresando…" are announced to screen readers.
  - The public home's "sign up / log in" line is a link to the login, and is hidden once you're logged in.
  - A catalog or pack that fails to load keeps the page (header, way back) with a clear translated message and "Reintentar", instead of axios's raw English error.
  - A track or sample that can't be played says so on its row (or on the browser's screen) instead of being skipped silently.
  - Esc closes the color window right after clicking its button too (it used to leave the page); "COLOR", "TEMA" and "ACENTO" are translated.
  - The Beats SEO description no longer says beats can be downloaded.
- Design review, phones and performance:
  - On phones the track list and the sample tree grow with the page instead of scrolling inside it, so a swipe that starts on them scrolls the page.
  - The seek bar can be dragged with a finger or the mouse (it only jumped on click).
  - On touch screens the row play button, the language and color buttons are 44px and the home menu links are taller.
  - The next track is not preloaded with data saver on or on a 2g/3g connection.
  - The ring around the catalog record pauses its 66 animations while it's off screen.
- Design review, polish:
  - The "most chosen" license keeps its accent ring and glow when you hover or pick it.
  - Shared links show a large preview image (`og:image`, `summary_large_image`).
  - "Volver" buttons show keyboard focus and animate only what changes (no `transition: all`).
  - The home menu's letter rise is shorter (0.3s, 15ms per letter) because it replays on every arrow; the sample browser's waveform follows the keyboard in 0.15s.
  - Removed the unused `Samples.css`.
- Admin panel (from a design review):
  - Every upload works from the keyboard: Tab reaches the drop zones (single file and batch), Enter or Space opens the file picker, and the zone shows a focus ring.
  - Every button, link and field in the admin shows a visible focus ring in the page accent color; fields had none.
  - Single-file uploads show a progress bar with the percentage. An image that is still uploading or failed shows that state over its preview instead of looking done.
  - Catalog, sample pack and beat/loop/sample forms ask before Cancel throws away changes, and the browser warns before closing or reloading the tab with unsaved changes (also with batch files queued). Sidebar links inside the admin are not guarded yet.
  - Notifications are read by screen readers, have a close button, pause while the mouse or keyboard focus is on them, and errors stay until you close them.
  - Changing a user's role asks with a "Cambiar rol" button instead of a red "Eliminar", roles show translated, and an admin can no longer remove their own admin role.
  - Confirmation dialogs keep Tab inside them and give focus back to the button that opened them.
  - Edit on a beat, loop or sample lower in the list scrolls the form into view and puts the cursor in the title.
  - Every form field has a name for screen readers, errors are linked to their field, and a failed save moves the cursor to the first field with an error.
  - Deleting a folder of a sample pack asks first. Duplicate and Delete buttons (and the role button) stay disabled while their request runs, so a double click no longer makes two copies.
  - The dashboard shows an error with a Retry button when the stats can't load, instead of zeros.
  - The admin spinner, loading placeholders, notifications and sidebar respect reduced motion; a few hint texts got back their dim color.
- Phones (found in a 390px review with Playwright):
  - The page color window opened about 75px off the left edge of the screen. It now moves back inside.
  - Pages taller than the screen showed white when stretched or while loading; the page underneath is dark now.
  - The Prod Mix Master header broke "NIVØ BEATS" and "Cerrar sesión" into two lines; it now stacks like Beats.
- Beat catalogs no longer say "free for non-profit use": beats can't be downloaded. Loop catalogs keep it.
- Login no longer blames ad blockers for every failure. If the server didn't answer, it says so (connection or blockers); after too many attempts it asks you to wait; if the server answered with an error, it says the problem is on our side.
- Sample pack browser: picking a folder (click or keyboard) now updates the screen, not only samples. Durations read "2.4 s" under 10 seconds and "0:23" from there, instead of "0:02" for every one-shot.
- Sample pack page: the "niv0 beats" header looks the same as on the showcase instead of a raw link, and the cover, info and browser are centered in one 800px column.
- Admin batch upload of samples says "Subir 5 samples" (the plural used the `_plural` suffix that i18next no longer reads).
- Sample packs texts reviewed in both languages: voseo in Spanish ("Descargá", "Arrastrá", "Podés", "Buscá"), new SEO description, "Pick a sample to hear it" and other English fixes.
- The sample pack page drew underneath the fixed page background, so the browser, the names and the ZIP button were hidden. It now sits above it, with left-aligned text, the Bebas ZIP button and a stacked header on phones.
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
