# 0002 — Migrate to Vite

**Status:** accepted · **Date:** 2026-10 · Supersedes [0001](0001-stay-on-cra-for-now.md)

## Context

[ADR 0001](0001-stay-on-cra-for-now.md) kept the app on Create React App and left a migration plan for later. Once the bugs, security and tests were in order, the cost of staying became the bigger problem. Installs needed `--legacy-peer-deps`, every build printed deprecation warnings, and CRA won't get fixes anymore.

## Decision

Move to Vite + Vitest, following the plan in 0001:

- `index.html` at the root, with `/src/index.jsx` as the entry point.
- Files with JSX renamed to `.jsx`.
- `REACT_APP_*` → `VITE_*`, read with `import.meta.env`.
- Jest → Vitest with jsdom. The React Testing Library tests stay the same, with `jest.*` → `vi.*`.
- ESLint 9 flat config instead of CRA's built-in config.
- Same port (3000) and same output folder (`build/`), so CORS, the Google client and Vercel need no other changes.

## Consequences

- Production build: about 33 s with CRA, about 1 s with Vite, on the same machine and code.
- `npm install` works without `--legacy-peer-deps`, and `.npmrc` is gone.
- Vercel needs the env vars under their new `VITE_*` names.
- The tests run once by default (`npm test`), which is what CI wants.
- TypeScript is now an easy next step if it's ever needed: Vite supports `.tsx` out of the box.
