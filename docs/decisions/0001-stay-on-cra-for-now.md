# 0001 — Stay on Create React App for now

**Status:** superseded by [0002](0002-migrate-to-vite.md) · **Date:** 2026-09

## Context

The project started on Create React App 5. CRA no longer gets updates: it pulls in old dependencies (`--legacy-peer-deps`, deprecated babel warnings), Jest runs slower than current alternatives, and the dev server is slow compared to Vite.

It still works, though. The build is stable on Vercel, the tests pass, and none of the problems block a feature today.

## Decision

Stay on CRA for now, and spend the effort on bugs, security and tests first. Migrate to Vite when one of these happens:

- a dependency we need doesn't support CRA / webpack 5, or
- we start moving to TypeScript (worth doing both in the same stretch of work).

## Migration plan

Estimated at 1-2 days:

1. Install `vite` and `@vitejs/plugin-react`, and move `public/index.html` to the root with `<script type="module" src="/src/index.js">`.
2. Env vars: `REACT_APP_*` → `VITE_*` in `src/config.js` (`import.meta.env`), in Vercel (Production and Preview) and in `.github/workflows/ci.yml`.
3. Tests: Jest → Vitest + jsdom. The React Testing Library tests stay as they are. Replace `jest.fn/mock` with `vi.fn/mock`.
4. Rename files that contain JSX to `.jsx` (Vite needs it by default).
5. Vercel: framework preset "Vite", output `dist/`. Check it on a preview deploy before touching `main`.
6. Drop `--legacy-peer-deps` and `.npmrc` if the install no longer needs them.

After that, TypeScript can be adopted gradually (`allowJs`), starting with `services/api.js` and the hooks, which is where types pay off most.

## Consequences

- Until the migration, we live with the install and deprecation warnings.
- The ADR leaves the criteria written down, so the decision gets revisited on purpose instead of being forgotten.
