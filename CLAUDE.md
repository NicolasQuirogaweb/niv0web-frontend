# CLAUDE.md

Context for AI coding agents working in this repo. Humans: see README.md.

## Commands

- `npm run dev`: Vite dev server on :3000 (fixed port: CORS and the Google client allow it). Needs `.env` with `VITE_BACKEND_URL` and `VITE_GOOGLE_CLIENT_ID`.
- `npm test`: Vitest, runs once and exits. `npm run test:watch` for watch mode.
- `npm run lint`: `--max-warnings=0`, so a warning fails CI.
- `npm run build`: production build into `build/` (no source maps, see `vite.config.js`).

Run lint and tests before saying a change is done.

## How the code is laid out

- All HTTP goes through `src/services/api.js`. Components never import axios or call `fetch`. The response interceptor unwraps `{ success, data }`, so `res.data` is already the payload.
- Public pages fetch with `usePublicResource().run(promise)`. Admin lists use `useAdminResource`. Abort errors are ignored with `utils/isAbortError`.
- Private pages start with `<PageHeader />` and render tracks with `<TrackList />`. Don't copy those blocks back into pages.
- Playback state lives in `usePlaylistPlayer` (two detached `Audio` elements: one plays, the other preloads the next track), created by the page and passed to `<TrackList player={...} />` and `<PlayAllButton />`. `AudioPlayer` is presentational only. Never render an `<audio>` per row.
- Beat catalogs are listen-only: `Playlist` passes `allowDownload={resourceType !== "beats"}` to `TrackList`. Never add a free download for beats (they are sold with a license); sample packs and loops keep theirs.
- Play `track.previewFile || track.audioFile`; download only `track.audioFile`. Downloads go through `downloadTrack` (signed B2 link, proxy as fallback): never go back to fetching the file into a blob as the main path, it makes downloads look frozen.
- Track changes must set `src` and call `play()` synchronously inside the handler that triggered them (`loadAndPlay`). Don't move that into a `useEffect` or pass `src` as a prop: it breaks "next" from the Android lock screen. `src/hooks/usePlaylistPlayer.test.jsx` has a test that checks this.
- `/about` is public: it must not use `PageHeader`, `useAuth` or anything that needs a session, and must not be wrapped in `PrivateRoute`. Releases play in Spotify's embed, never in `usePlaylistPlayer` (plays must count on Spotify).
- Auth state lives in `AuthContext`, filled from `GET /api/auth/verify-token`. Tokens are httpOnly cookies: never read, store or send a token from JS, and never write auth data to `localStorage`.

## Conventions

- Every visible string is an i18n key, and it must be added to **both** `src/i18n/es.json` and `en.json` (they have to keep the same keys). Spanish is the default language.
- Public pages use global CSS per page (`Beats.css`...). The admin uses `admin.module.css`. Follow whichever the file you're in uses.
- **Visual style:** new or redesigned components use the tokens in `src/styles/tokens.css` (never a raw `#bbf0be`), hover is lift + glow and always also `:focus-visible`, and every animation has a `prefers-reduced-motion` fallback. Follow the `ui-component` skill and `docs/decisions/0003-visual-system.md`.
- **Backgrounds:** logged-in pages render `<PageBackground media={...} />` with data from `src/content/backgrounds.js` (or `catalogBackground()` for a catalog). Never put a background image or video in CSS or a raw `<video>` in a page: `PageBackground` handles poster-first, load after `window.load`, reduced motion, data saver, slow connections, mobile source and pausing hidden tabs (ADR 0004). Encode videos with `scripts/encode-background.sh`.
- **Keyboard:** section pages call `useConsoleNav({ back })`, and whatever can be picked carries `data-nav-item` (plus `data-nav-press="<selector>"` when Enter should press a button inside it). Style the picked item through `[data-nav-active="true"]`, the same as hover (ADR 0008).
- Data a component displays that may later come from the API (license prices, features) lives in `src/content/`; texts live in i18n.
- Navigation that looks like a button is `<Link className="back-to-catalogue-btn">`, never a `<button>` inside a `<Link>`.
- New routes are lazy (`lazyNamed` in `src/routes/MyRoutes.js`).
- Commits: conventional commits, with a body explaining why.

## Contract with the API

The backend is `niv0web-backend`. Fields the UI depends on: `itemsCount` on catalogs, `beatPlaylists`/`loopPlaylists` on `/api/admin/dashboard`, and the playlist response keeping its items under the same key as the type (`beats`, `loops`, `samples`). If you change a call in `services/api.js`, say whether the backend has to change too.

## Don't

- Don't start a TypeScript migration as a side effect of another task.
- Env vars are read with `import.meta.env.VITE_*`, never `process.env`. Files with JSX use the `.jsx` extension.
- Don't add media to `public/`. Catalog media is served from Backblaze B2.
- Don't read or print `.env`.

## Skills

- `.claude/skills/add-page`: new page with route, i18n keys, SEO and test.
- `.claude/skills/release-check`: before merging to `main` (Vercel deploys it).
- `.claude/skills/ui-component`: build or restyle a visual component in niv0's style (tokens, glass, focus, reduced motion, i18n, tests).
