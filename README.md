# niv0web

[![CI](https://github.com/NicolasQuirogaweb/niv0web-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/NicolasQuirogaweb/niv0web-frontend/actions/workflows/ci.yml)

The frontend of **niv0 prod**, where I publish my beats, loops and sample packs. You log in with Google, listen in the browser and download what you want. I manage the whole catalog from an admin panel built into the same app.

<!-- ✍️ NICO: a screenshot or GIF here beats any paragraph. Suggestion: a 10-second GIF showing
     home → a catalog → play → download. Save it to docs/ and link it:  ![niv0 demo](docs/demo.gif) -->

<!-- ✍️ NICO: 2-3 lines about why it exists (same idea as the backend README, don't copy it word for word). -->

Live: [niv0web.vercel.app](https://niv0web.vercel.app) · API: [niv0web-backend](https://github.com/NicolasQuirogaweb/niv0web-backend)

> Versión en español: [README.es.md](README.es.md)

## Stack and why

| | Choice | Why |
|---|---|---|
| UI | React 18 (Create React App) | It's what the project started on. Migrating to Vite is planned but not urgent ([ADR 0001](docs/decisions/0001-stay-on-cra-for-now.md)). |
| Routing | React Router 6 | Every page is lazy-loaded, the admin panel included. |
| Data | axios + a couple of small hooks | There's no global cache: each page fetches what it shows. `usePublicResource` and `useAdminResource` hold the loading and error logic. |
| Auth | Google Sign-In, session in httpOnly cookies | The frontend never touches a token ([why](https://github.com/NicolasQuirogaweb/niv0web-backend/blob/main/docs/decisions/0001-httponly-cookies.md)). |
| i18n | i18next, ES/EN | Everything visible goes through translation keys. The two files have the same 224 keys. |
| Hosting | Vercel | Deploys from `main`, with preview deploys on PRs. |

## Run it locally

```bash
cp .env.example .env          # REACT_APP_BACKEND_URL and REACT_APP_GOOGLE_CLIENT_ID
npm install --legacy-peer-deps
npm start                     # http://localhost:3000
npm test                      # watch mode; CI runs with --watchAll=false
```

The app needs the [API](https://github.com/NicolasQuirogaweb/niv0web-backend) running (default `http://localhost:5000`). If a variable is missing, the app fails on startup with a clear message (`src/config.js`).

`--legacy-peer-deps` is there because CRA 5 declares old peer dependency ranges. It's one of the reasons to migrate.

## Pages

| Route | Access | |
|---|---|---|
| `/home` | public | Landing |
| `/login` | public | Google Sign-In. The first login creates the account. |
| `/homelogued` | logged in | Home with links to each section |
| `/beats`, `/loops` | logged in | Catalog grids |
| `/:type/playlist/:id` | logged in | A catalog with player and download (`type` = `beats` or `loops`) |
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

**Downloads:** B2 files are on another domain, so the browser ignores `<a download>`. `utils/download.js` fetches them through the API proxy and saves them as a blob.

## Quality

- `npm run lint`: ESLint with zero warnings allowed.
- `npm test`: React Testing Library. It covers the session and refresh interceptor, the route guards, a full admin CRUD flow, the playlist page by type, the sample pack edit form and the dashboard.
- CI (GitHub Actions) runs lint, tests and a build on every push and PR.
- Accessibility: the player's seek bar can be used from the keyboard, confirmation dialogs are real dialogs (focus and Esc), and `<html lang>` follows the chosen language.

## Decisions

- [0001 — Stay on CRA for now (and how to leave it)](docs/decisions/0001-stay-on-cra-for-now.md)

The API-side decisions (cookies, B2, Docker) are documented in [the backend](https://github.com/NicolasQuirogaweb/niv0web-backend/tree/main/docs/decisions).

## Known limitations

- Create React App no longer gets updates. See the ADR for the migration plan.
- Styles are mixed: global CSS per page on the public side, CSS modules in the admin, and some inline styles.
- No SSR. The public pages need a login anyway, so SEO only matters for `/home`.

<!-- ✍️ NICO: "What I'd do next". Suggestions: migrate to Vite, TypeScript, a global player that keeps
     playing when you change pages. Pick the ones you actually want to do. -->

## Working with AI

I build this with Claude Code. The repo has what an agent needs so it doesn't start from zero:
[`CLAUDE.md`](CLAUDE.md) (conventions and limits), [`.claude/settings.json`](.claude/settings.json) (permissions and a hook that runs ESLint on every edited file) and [`.claude/skills/`](.claude/skills) (how to add a page with its translations, and the pre-release checklist).

<!-- ✍️ NICO: a line of your own about how you work with it. -->

## License

[MIT](LICENSE)
