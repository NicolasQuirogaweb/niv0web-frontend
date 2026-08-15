# Security notes

Findings and known trade-offs that don't have a fix contained entirely within this repo, tracked here instead of being silently left in code comments.

## 1. `VERCEL_OIDC_TOKEN` exposed in git history

Commit `765e72f` removed `.env.vercel` from tracking, but the file (and the `VERCEL_OIDC_TOKEN` it contained) still exists in the git history of this repository. Removing a file from tracking does not invalidate a secret that was ever committed.

**Action needed:** rotate this token in the Vercel project settings. Once rotated, the old value in git history is harmless.

## 2. Access token and role stored in `localStorage` — RESOLVED on the frontend, pending backend rollout

**Status:** the frontend side of this migration is done. `AuthContext.js`/`services/api.js` no longer read or write `authToken`/`userEmail`/`userRole` to `localStorage` — `userEmail`/`userRole` live only in React state, re-derived from `GET /api/auth/verify-token` on every mount, and no request manually sets an `Authorization` header anymore (`withCredentials: true` lets the browser attach cookies automatically).

**This only works once the backend also ships its half.** See [BACKEND_MIGRATION_GUIDE.md](BACKEND_MIGRATION_GUIDE.md) for the full spec to hand to whoever (or whichever Claude session) is working in the backend repo: it needs to `Set-Cookie` the access token as `httpOnly`/`Secure`/`SameSite=None` on login and refresh (mirroring the refresh-token cookie, which already works cross-site in production), authenticate `verify-token` purely from that cookie, and clear it on logout. Until the backend deploys this, logging in against this frontend will not persist a session — see the guide's rollout section for the safe deploy order (backend first, in dual-mode, then this frontend, then backend removes the old body/header fallback).
