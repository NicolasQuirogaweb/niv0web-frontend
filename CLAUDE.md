# CLAUDE.md

Context for AI coding agents working in this repo. Humans: see README.md.

## Commands

- `npm start`: dev server on :3000. Needs `.env` with `REACT_APP_BACKEND_URL` and `REACT_APP_GOOGLE_CLIENT_ID`.
- `CI=true npm test -- --watchAll=false`: tests once, non-interactive. Plain `npm test` opens watch mode and never exits.
- `npm run lint`: `--max-warnings=0`, so a warning fails CI.
- `npm run build`: production build (no source maps, see `.env.production`).
- Install with `npm install --legacy-peer-deps` (CRA 5 peer ranges).

Run lint and tests before saying a change is done.

## How the code is laid out

- All HTTP goes through `src/services/api.js`. Components never import axios or call `fetch`. The response interceptor unwraps `{ success, data }`, so `res.data` is already the payload.
- Public pages fetch with `usePublicResource().run(promise)`. Admin lists use `useAdminResource`. Abort errors are ignored with `utils/isAbortError`.
- Private pages start with `<PageHeader />` and render tracks with `<TrackList />`. Don't copy those blocks back into pages.
- Auth state lives in `AuthContext`, filled from `GET /api/auth/verify-token`. Tokens are httpOnly cookies: never read, store or send a token from JS, and never write auth data to `localStorage`.

## Conventions

- Every visible string is an i18n key, and it must be added to **both** `src/i18n/es.json` and `en.json` (they have to keep the same keys). Spanish is the default language.
- Public pages use global CSS per page (`Beats.css`...). The admin uses `admin.module.css`. Follow whichever the file you're in uses.
- Navigation that looks like a button is `<Link className="back-to-catalogue-btn">`, never a `<button>` inside a `<Link>`.
- New routes are lazy (`lazyNamed` in `src/routes/MyRoutes.js`).
- Commits: conventional commits, with a body explaining why.

## Contract with the API

The backend is `niv0web-backend`. Fields the UI depends on: `itemsCount` on catalogs, `beatPlaylists`/`loopPlaylists` on `/api/admin/dashboard`, and the playlist response keeping its items under the same key as the type (`beats`, `loops`, `samples`). If you change a call in `services/api.js`, say whether the backend has to change too.

## Don't

- Don't migrate to Vite or TypeScript as a side effect of another task. There's a plan in `docs/decisions/0001-stay-on-cra-for-now.md`.
- Don't add media to `public/`. Catalog media is served from Backblaze B2.
- Don't read or print `.env`.

## Skills

- `.claude/skills/add-page`: new page with route, i18n keys, SEO and test.
- `.claude/skills/release-check`: before merging to `main` (Vercel deploys it).
