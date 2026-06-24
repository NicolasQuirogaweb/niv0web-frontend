# 🎵 niv0web — Frontend

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](package.json)
[![React Router](https://img.shields.io/badge/React_Router-6.26-CA4245?logo=reactrouter)](package.json)
[![i18next](https://img.shields.io/badge/i18next-26.3-26A69A?logo=i18next)](package.json)
[![Axios](https://img.shields.io/badge/Axios-1.7-5A29E4?logo=axios)](package.json)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8)](public/manifest.json)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)](https://vercel.com)

**niv0 prod** is a digital audio marketplace where producers showcase beats, samples, loops, and prod-mix-master services. This is the React SPA with full i18n (EN/ES), Google OAuth authentication, and a complete admin panel with CRUD operations for all resources.

---

## Architecture

```
index.js
  ├── HelmetProvider (SEO via react-helmet-async)
  │   └── ErrorBoundary (crash recovery)
  │       └── App.js
  │           └── MyRoutes.js (BrowserRouter)
  │               └── AuthProvider (React Context)
  │                   │
  │                   ├── [Public Routes]
  │                   │   ├── /home        → Home (landing)
  │                   │   ├── /homelogued  → HomeLogued (logged-in landing)
  │                   │   └── /login       → Login (GoogleOAuthProvider)
  │                   │
  │                   ├── [Private Routes] (via PrivateRoute)
  │                   │   ├── /beats            → Beats → CardPlaylist[]
  │                   │   ├── /samplepacks      → SamplePacks → CardPlaylist[]
  │                   │   ├── /:type/playlist/:id → Playlist → AudioPlayer[]
  │                   │   ├── /samples/samplepack/:id → Samples → AudioPlayer[]
  │                   │   ├── /loops            → Loops
  │                   │   └── /prodmixmaster    → ProdMixMaster
  │                   │
  │                   └── [Admin Routes] (via AdminRoute)
  │                       └── AdminLayout (sidebar + topbar)
  │                           ├── ToastProvider
  │                           │   └── ConfirmProvider
  │                           │       └── <Outlet />
  │                           │           ├── AdminDashboard
  │                           │           ├── AdminPlaylists (type=beats|loops)
  │                           │           ├── AdminPlaylistForm
  │                           │           ├── AdminBeats
  │                           │           ├── AdminLoops
  │                           │           ├── AdminSamplePacks
  │                           │           ├── AdminSamples
  │                           │           ├── AdminProdMixMaster
  │                           │           └── AdminUsers
  │                           │
  │                           └── AdminUploader (drag & drop)
  │
  └── serviceWorkerRegistration (PWA)
```

**Data flow:**
```
Component → api.js (Axios interceptor adds JWT)
  → Express API (Render)
    → MongoDB (Atlas) + Backblaze B2 (storage)
```

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | React 18.3 | UI library |
| **Routing** | react-router-dom 6.26 | SPA routing with lazy loading |
| **Auth** | @react-oauth/google 0.12 | Google OAuth popup |
| **HTTP** | Axios 1.7 | API client with interceptors |
| **i18n** | i18next 26.3 + react-i18next 17.0 | Full ES/EN localization |
| **SEO** | react-helmet-async 3.0 | Dynamic meta tags |
| **Icons** | react-icons (MD) + FontAwesome 6 | UI icons |
| **Styling** | CSS Modules (admin) + Global CSS (public) | Scoped + global styles |
| **PWA** | Service Worker | Offline support |
| **Build** | Create React App 5.0 | Build toolchain |
| **Deploy** | Vercel | Hosting + CI/CD |

---

## Features

- **Google OAuth login** — one-click sign-in with Google, JWT stored in localStorage + httpOnly refresh cookie
- **Full i18n** — Spanish (default) and English, persisted in localStorage, toggleable via LanguageSwitcher
- **SEO per page** — each route sets its own `<title>` and `<meta>` via `react-helmet-async`
- **Audio player** — custom `<AudioPlayer>` with seek bar, time display, and singleton playback (only one plays at a time)
- **Direct file download** — downloads proxy through the backend to bypass B2 CORS restrictions
- **Real logout** — calls `POST /api/auth/logout`, clears localStorage and context, navigates to home
- **Admin panel** — full CRUD for all resources with drag-and-drop batch upload, confirmation dialogs, toast notifications
- **Responsive design** — mobile-first with CSS breakpoints; admin panel uses CSS Modules for scoped styles
- **AbortController** — cancels in-flight API requests on unmount to prevent race conditions and reduce 429 errors
- **PWA** — installable as a standalone app with service worker
- **Lazy loading** — all page components use `React.lazy()` + `Suspense` for code splitting

---

## Project Structure

```
niv0-web/
├── public/
│   ├── index.html
│   ├── manifest.json           # PWA manifest
│   └── images/                 # Static assets organized by section
│       ├── beats/
│       ├── Loops/
│       ├── Sample packs/
│       ├── logued/
│       ├── nologued/
│       └── icons/              # SVG icons (download, play, pause, etc.)
│
├── src/
│   ├── index.js                # Entry point: HelmetProvider, ErrorBoundary, i18n init
│   ├── App.js                  # Root component
│   ├── config.js               # Env constants + validation (fails fast)
│   ├── index.css               # Global styles, CSS variables
│   │
│   ├── context/
│   │   └── AuthContext.js      # Auth state (token, email, role) + persistence
│   │
│   ├── hooks/
│   │   ├── useAuth.js          # useAuth() + useRequireAuth()
│   │   ├── useToast.js         # Toast notification system (Context + Provider)
│   │   ├── useConfirm.js       # Confirmation modal (Context + Provider)
│   │   ├── useFetch.js         # Generic fetch hook (loading/data/error/refetch)
│   │   └── useResponsiveWidth.js # Responsive dimension hook
│   │
│   ├── services/
│   │   └── api.js              # Axios instance + interceptors + ALL service objects
│   │
│   ├── routes/
│   │   ├── MyRoutes.js         # Route table with lazy loading
│   │   ├── PrivateRoutes.js    # Auth guard (redirects to /home)
│   │   └── AdminRoute.js       # Admin guard (redirects to /homelogued)
│   │
│   ├── i18n/
│   │   ├── config.js           # i18next initialization (es default, en fallback)
│   │   ├── es.json             # Spanish translations (289 keys)
│   │   └── en.json             # English translations (289 keys)
│   │
│   ├── utils/
│   │   └── download.js         # downloadFile() — proxy through backend
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── SEO.js              # Dynamic meta tags via react-helmet-async
│   │   │   ├── AudioPlayer.js/css  # Custom audio player with seek + singleton
│   │   │   ├── LanguageSwitcher.js # ES/EN toggle (persisted in localStorage)
│   │   │   └── ErrorBoundary.js/css# Crash recovery UI
│   │   │
│   │   ├── Home.js/css             # Public landing page
│   │   ├── HomeLogued.js/css       # Authenticated landing page
│   │   ├── Login.js/css            # Google OAuth login
│   │   ├── Beats.js/css            # Beats catalog → CardPlaylist[]
│   │   ├── Playlist.js/css         # Single playlist with AudioPlayer[]
│   │   ├── SamplePacks.js/css      # Sample packs catalog → CardPlaylist[]
│   │   ├── Samples.js/css          # Single sample pack with AudioPlayer[]
│   │   ├── Loops.js                # Loops catalog
│   │   ├── ProdMixMaster.js/css    # Prod mix master (static + Spotify)
│   │   └── CardPlaylist.js/css     # Reusable playlist card (memo-ized)
│   │
│   └── admin/
│       ├── AdminLayout.js      # Sidebar + topbar + Outlet shell
│       ├── AdminDashboard.js   # Stats cards + quick action links
│       ├── AdminPlaylists.js   # CRUD list (beats/loops catalogs)
│       ├── AdminPlaylistForm.js# Create/edit playlists + sample packs
│       ├── AdminBeats.js       # CRUD + batch upload (drag-drop audio files)
│       ├── AdminLoops.js       # CRUD for loops
│       ├── AdminSamplePacks.js # CRUD list for sample packs
│       ├── AdminSamples.js     # CRUD + batch upload for samples
│       ├── AdminProdMixMaster.js# CRUD for prod mix items
│       ├── AdminUsers.js       # List users + toggle admin role
│       ├── AdminUploader.js    # Drag-drop file upload component
│       ├── Spinner.js          # Spinner, SkeletonCard, SkeletonLine
│       ├── icons.js            # Centralized react-icons/md mapping
│       ├── adminStyles.js      # Design tokens (colors, radius, badge)
│       └── admin.module.css    # CSS Modules (scoped admin styles)
│
└── vercel.json                 # SPA rewrites
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see [niv0web-backend](https://github.com/NicolasQuirogaweb/niv0web-backend))
- Google Cloud Console OAuth 2.0 Client ID

### Installation

```bash
nvm use
npm install
cp .env.example .env   # fill in your values
npm start               # starts on http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_BACKEND_URL` | ✅ | Backend API base URL (e.g., `http://localhost:5000`) |
| `REACT_APP_GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |

The app validates these at startup via `config.validateEnv()` and throws immediately if missing (fail-fast approach).

> **Production:** Set these in the Vercel dashboard. The `.env.vercel` file is for local Vercel CLI development only.

---

## Routing

| Route | Component | Access | Description |
|---|---|---|---|
| `/` | Redirect → `/home` | Public | Root redirect |
| `/home` | `Home` | Public | Landing page with resource links |
| `/homelogued` | `HomeLogued` | Public | Logged-in landing with user info |
| `/login` | `Login` | Public | Google OAuth sign-in |
| `/beats` | `Beats` | Authenticated | Beat playlist catalog |
| `/samplepacks` | `SamplePacks` | Authenticated | Sample pack catalog |
| `/:resourceType/playlist/:playlistId` | `Playlist` | Authenticated | Playlist detail |
| `/samples/samplepack/:samplepackId` | `Samples` | Authenticated | Sample pack detail |
| `/loops` | `Loops` | Authenticated | Loops catalog |
| `/prodmixmaster` | `ProdMixMaster` | Authenticated | Prod mix master page |
| `/admin` | `AdminDashboard` | Admin | Admin dashboard (stats) |
| `/admin/playlists` | `AdminPlaylists` | Admin | CRUD: beat catalogs |
| `/admin/playlists/new` | `AdminPlaylistForm` | Admin | Create beat catalog |
| `/admin/playlists/:id/edit` | `AdminPlaylistForm` | Admin | Edit beat catalog |
| `/admin/playlists/:id/beats` | `AdminBeats` | Admin | CRUD: beats in playlist |
| `/admin/loops` | `AdminPlaylists` | Admin | CRUD: loop catalogs |
| `/admin/loops/new` | `AdminPlaylistForm` | Admin | Create loop catalog |
| `/admin/loops/:id/loops` | `AdminLoops` | Admin | CRUD: loops in playlist |
| `/admin/samplepacks` | `AdminSamplePacks` | Admin | CRUD: sample packs |
| `/admin/samplepacks/new` | `AdminPlaylistForm` | Admin | Create sample pack |
| `/admin/samplepacks/:id/samples` | `AdminSamples` | Admin | CRUD: samples in pack |
| `/admin/prodmix` | `AdminProdMixMaster` | Admin | CRUD: prod mix items |
| `/admin/users` | `AdminUsers` | Admin | Manage user roles |
| `*` | 404 page | Public | Not found |

All routes use `React.lazy()` + `Suspense` for code splitting.

---

## Authentication Flow

```
1. Login
   User clicks "Login with Google" → Google OAuth popup
     → onSuccess(id_token)
     → api.authService.googleLogin(credential)
     → POST /api/auth/google-login
     → Backend returns { token, user: { email, role } }
     → saveAuth() → localStorage + AuthContext

2. Persistence
   App mount → AuthContext reads localStorage
     → api.authService.verifyToken()
     → If valid: set user state
     → If invalid (401): clearAuth() → redirect to /home

3. Token Refresh
   Any API call → Axios response interceptor catches 401
     → Queue failed request
     → POST /api/auth/refresh (httpOnly cookie)
     → Retry original request with new token
     → If refresh fails: clearAuth() → redirect to /login

4. Route Guards
   PrivateRoute → checks isAuthenticated → redirects to /home if false
   AdminRoute   → checks isAdmin → redirects to /homelogued if false

5. Logout
   handleLogout() → api.authService.logout()
     → POST /api/auth/logout
     → clearAuth() → localStorage.removeItem("authToken")
     → navigate("/", { replace: true })
```

---

## Internationalization (i18n)

- **Default language:** Spanish (`es`)
- **Fallback:** Spanish
- **Detection:** `localStorage.getItem("lang")` (persisted across sessions)
- **Library:** `i18next` + `react-i18next`

The `<LanguageSwitcher>` component toggles between ES/EN and persists the choice. All UI strings use the `useTranslation()` hook (`t("key")` pattern).

**Translation keys structure:**
```
nav          → Navigation (logIn, logOut, adminPanel, etc.)
lang         → Language switcher (switchTo, switchFrom)
seo          → SEO meta tags (siteName, fallbackDesc)
player       → Audio player (play, pause)
home         → Landing page
beats        → Beats catalog
playlist     → Playlist detail
samples      → Samples detail
samplePacks  → Sample packs catalog
loops        → Loops catalog
prodMix      → Prod mix master
login        → Login page
notFound     → 404 page
admin.*      → Admin panel (dashboard, nav, CRUD labels, toast messages, validation)
```

---

## Admin Panel

The admin panel is a protected section under `/admin/*` with:

- **Sidebar navigation** — collapsible, with icons for Dashboard, Beats, Sample Packs, Prod Mix, Users
- **Toast notifications** — success (green, 3.5s) and error (red, 5s) feedback via `useToast()`
- **Confirmation dialogs** — destructive actions (delete, role change) require confirmation via `useConfirm()`
- **AbortController** — all list-fetching pages cancel in-flight requests on unmount to prevent 429 rate-limit errors
- **Batch upload** — drag-and-drop multiple audio files → upload to B2 → create items in one flow
- **Skeleton loading** — `Spinner.js` provides skeleton cards/lines while data loads
- **Responsive design** — CSS Modules with `flex-wrap`, mobile breakpoints (≤768px), stacked cards on small screens

---

## Data Fetching Patterns

| Pattern | Used In | Description |
|---|---|---|
| `useState` + `useEffect` | Public pages (Beats, Playlist, etc.) | Simple fetch on mount |
| `useCallback` + `useEffect` + `AbortController` | Admin pages | Cancels requests on unmount |
| `useToast` | Admin CRUD | Success/error feedback |
| `useConfirm` | Admin destructive actions | Confirmation before delete/role change |
| `adminService.upload.batch()` | Admin upload flow | Uploads files, then creates items |
| `downloadFile()` | Playlist, Samples | Proxies download through backend |

---

## Styling

| Scope | Approach | Files |
|---|---|---|
| **Global** | Plain CSS with CSS custom properties | `index.css`, `App.css` |
| **Public pages** | One CSS file per component | `Home.css`, `Beats.css`, `Playlist.css`, etc. |
| **Admin panel** | CSS Modules (scoped class names) | `admin.module.css` |
| **Design tokens** | JS object with color/radius values | `admin/adminStyles.js` |
| **Icons** | Centralized `react-icons/md` mapping | `admin/icons.js` |

**Color scheme (dark theme):**
- Background: `#0a0a0a`
- Surfaces: `#111` / `#1a1a1a`
- Accent: `#7c6ff0` (purple)
- Text: `#e0e0e0`

---

## PWA

The app registers a service worker in production mode (`NODE_ENV === "production"`). The `manifest.json` provides:
- `display: standalone` — full-screen app when installed
- `start_url: /home` — landing page on launch
- Dark theme colors matching the app design

---

## Deployment

The app is deployed on **Vercel** with automatic CI/CD from GitHub.

**`vercel.json`:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This single rewrite ensures all SPA routes work correctly when accessed directly (Vercel serves `index.html` for every path).

**Build command:** `react-scripts build` (default CRA)
**Output directory:** `build/`

---

## Available Scripts

```bash
npm start       # Development server (http://localhost:3000)
npm run build   # Production build to build/
npm test        # Test runner (jest)
npm run eject   # Eject CRA (irreversible)
```

---

## License

MIT — built by [Nicolas Quiroga](https://github.com/NicolasQuirogaweb)
