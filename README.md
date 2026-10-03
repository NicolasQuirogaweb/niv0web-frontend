# niv0web

[![CI](https://github.com/NicolasQuirogaweb/niv0web-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/NicolasQuirogaweb/niv0web-frontend/actions/workflows/ci.yml)

The frontend of **niv0 prod**, where I publish my beats, loops and sample packs. You log in with Google, listen in the browser and download what you want. I manage the whole catalog from an admin panel built into the same app.

<!-- ✍️ NICO: a screenshot or GIF here beats any paragraph. Suggestion: a 10-second GIF showing
     home → a catalog → play → download. Save it to docs/ and link it:  ![niv0 demo](docs/demo.gif) -->

I built niv0 so that when someone asks me "do you have beats I can use?", I can answer with a single link. Artists can browse my beats, loops and sample packs, listen to everything and download what they need, instead of waiting for me to send files one by one. It was also an excuse to build a music app of my own and have full control over how my catalog is shown.

The functionality is where I want it: an interactive catalog and a bridge to contact me. The UI and UX are still evolving while I find the look that fits.

Live: [niv0web.vercel.app](https://niv0web.vercel.app) · API: [niv0web-backend](https://github.com/NicolasQuirogaweb/niv0web-backend)

> Versión en español: [README.es.md](README.es.md)

## Stack and why

| | Choice | Why |
|---|---|---|
| UI | React 18 + Vite | Started on Create React App and moved to Vite when CRA stopped being maintained: production build went from ~33 s to ~1 s ([ADR 0002](docs/decisions/0002-migrate-to-vite.md)). |
| Routing | React Router 6 | Every page is lazy-loaded, the admin panel included. |
| Data | axios + a couple of small hooks | There's no global cache: each page fetches what it shows. `usePublicResource` and `useAdminResource` hold the loading and error logic. |
| Auth | Google Sign-In, session in httpOnly cookies | The frontend never touches a token ([why](https://github.com/NicolasQuirogaweb/niv0web-backend/blob/main/docs/decisions/0001-httponly-cookies.md)). |
| i18n | i18next, ES/EN | Everything visible goes through translation keys. The two files have the same 224 keys. |
| Hosting | Vercel | Deploys from `main`, with preview deploys on PRs. |

## Run it locally

```bash
cp .env.example .env          # VITE_BACKEND_URL and VITE_GOOGLE_CLIENT_ID
npm install
npm run dev                   # http://localhost:3000
npm test                      # vitest, runs once (npm run test:watch to keep it open)
```

The app needs the [API](https://github.com/NicolasQuirogaweb/niv0web-backend) running (default `http://localhost:5000`). If a variable is missing, the app fails on startup with a clear message (`src/config.js`).


## Pages

| Route | Access | |
|---|---|---|
| `/home` | public | Landing |
| `/login` | public | Google Sign-In. The first login creates the account. |
| `/homelogued` | logged in | Home with links to each section |
| `/beats`, `/loops` | logged in | Catalog grids |
| `/:type/playlist/:id` | logged in | A catalog played like an album: play-all button, auto-advance, download (`type` = `beats` or `loops`) |
| `/samplepacks`, `/samples/samplepack/:id` | logged in | Sample packs |
| `/prodmixmaster` | logged in | Production and mixing services |
| `/admin/*` | admin | Dashboard, beat and loop catalogs, sample packs, users |

`PrivateRoute` and `AdminRoute` only hide pages in the UI. The real permission checks happen in the API.

## How it's organized

```
src/
  components/         public pages (Beats, Playlist, Samples...) and their CSS
    common/           PageHeader, TrackList, AudioPlayer, SEO, ErrorBoundary
    admin/            admin panel (CSS modules)
  context/            AuthContext: who's logged in, from GET /verify-token
  hooks/              usePublicResource, useAdminResource, useToast, useConfirm
  services/api.js     the axios client and every endpoint. Nothing else calls the API directly.
  routes/             MyRoutes (lazy routes), PrivateRoute, AdminRoute
  i18n/               es.json / en.json
```

**Session:** `services/api.js` sends cookies with every request. When the API answers 401, the interceptor calls `/api/auth/refresh` once, queues the requests that come in meanwhile, and retries them. If the refresh fails, it clears the session and redirects to `/login`.

**Player:** playback is owned by `hooks/usePlaylistPlayer.js`, with two `<audio>` elements outside the DOM. The page decides whether a finished track hands over to the next one (beat and loop catalogs) or not (sample packs, where you audition one sound at a time). Tracks sit in a box with its own scroll, so on a phone you don't scroll the whole page to reach the last one. The hook also feeds the Media Session API, so the title, cover, a seek bar and play/pause/next/previous show up on the lock screen.

Why two elements: while one plays, the other is already downloading the next track. On "next" (or when a track ends) the hook switches to the preloaded element, so the change is near instant instead of opening a new connection and waiting for buffer. WAV tracks play their MP3 preview (`previewFile`, ~10x smaller, generated by the API); if the preview fails it retries with the original before skipping. While a track is loading, its play button and the play-all button show a spinner.

The hook drives the `<audio>` element imperatively on purpose. With the screen locked, Android Chrome only lets audio start inside the handler that triggered it (the notification's "next" button, the end of a track). If a track change went through a React re-render and a `useEffect` before calling `play()`, the call would arrive too late, the element would sit paused on a new `src`, and Chrome would drop the notification. So `loadAndPlay` swaps the `src` (or the preloaded element) and calls `play()` in the same tick, and React state only drives the UI.

**Downloads:** B2 files are on another domain, so the browser ignores `<a download>`. `utils/download.js` asks the API for a signed B2 link (`/api/download/link`) that forces `Content-Disposition: attachment` with the track title and the real extension, and points the browser at it. The download starts within half a second, with the browser's own progress bar, and the file never passes through the API or memory. The button is disabled with a spinner while the link is prepared and shows a ✓ afterwards, so extra taps do nothing. If the link can't be generated it falls back to the old proxy (the whole file through the API as a blob). Downloads always deliver the original file, never the preview.

## Quality

- `npm run lint`: ESLint with zero warnings allowed.
- `npm test`: Vitest + React Testing Library. It covers the session and refresh interceptor, the route guards, a full admin CRUD flow, the playlist page by type, the player (play all, auto-advance, stop at the end, no auto-advance in sample packs), the sample pack edit form and the dashboard.
- CI (GitHub Actions) runs lint, tests and a build on every push and PR.
- Accessibility: the player's seek bar can be used from the keyboard, confirmation dialogs are real dialogs (focus and Esc), and `<html lang>` follows the chosen language.

## Decisions

- [0001 — Stay on CRA for now](docs/decisions/0001-stay-on-cra-for-now.md) (superseded by 0002)
- [0002 — Migrate to Vite](docs/decisions/0002-migrate-to-vite.md)

The API-side decisions (cookies, B2, Docker) are documented in [the backend](https://github.com/NicolasQuirogaweb/niv0web-backend/tree/main/docs/decisions).

## Known limitations

- Styles are mixed: global CSS per page on the public side, CSS modules in the admin, and some inline styles.
- No SSR. The public pages need a login anyway, so SEO only matters for `/home`.
- **Licensing is manual.** The site states that tracks are free for non-profit use only and that commercial use needs a license, but buying one happens outside the app: you contact me through my social links. A proper license flow (terms per license type, checkout) is something I know I need to build.

**What I'd do next**

- Keep polishing the UI and UX until the look matches the music.
- A license flow inside the app: license types, terms and checkout.
- A global player that keeps playing while you move between pages.

## Working with AI

I build this with Claude Code. The repo has what an agent needs so it doesn't start from zero:
[`CLAUDE.md`](CLAUDE.md) (conventions and limits), [`.claude/settings.json`](.claude/settings.json) (permissions and a hook that runs ESLint on every edited file) and [`.claude/skills/`](.claude/skills) (how to add a page with its translations, and the pre-release checklist).

I use AI to move faster, not to stop thinking. I read what I ask for and what I get back, and I check every change before it goes in. It's a powerful tool, which is exactly why I keep studying it and following the practices that get the most out of it. This repo's setup is part of that.

## License

[MIT](LICENSE)
