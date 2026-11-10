# 0013. Sentry for production errors

Date: 2026-11-09. Status: accepted.

## Context

Errors that visitors hit in production were invisible unless Nicolás ran into them himself, like the login that only failed for one email.

## Decision

Use Sentry (free plan, organization `nquirogawebdev`, project `niv0-frontend`) through `@sentry/react`:

- `src/utils/monitoring.js` loads the SDK with a dynamic `import()` after the first render, so it adds nothing to the initial load. Without `VITE_SENTRY_DSN` it loads nothing.
- `ErrorBoundary` reports what it catches with the React component stack. Sentry's own global handlers catch uncaught errors and rejected promises once it's loaded.
- `sendDefaultPii: false` and `tracesSampleRate: 0`: no IPs, cookies or headers, no performance traces and no session replay, only errors. That keeps us inside the free quota.
- `VITE_SENTRY_DSN` is set only for Vercel's Production environment, so previews and local runs send nothing.

The backend has its own project, `niv0-backend` (backend ADR 0006).

## Consequences

- An error that happens before the SDK finishes loading (the first moments of a visit) is not reported.
- Stack traces point at the minified bundle: source maps are not uploaded yet. That needs a Sentry auth token in Vercel's build and can be added later if the traces are hard to read.
