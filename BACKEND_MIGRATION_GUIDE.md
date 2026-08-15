# Backend Migration: Access Token from JSON Body to httpOnly Cookie

## Context

The frontend (React SPA, deployed on Vercel) currently receives the JWT
access token in the JSON response body on login (`POST /api/auth/google-login`)
and on refresh (`POST /api/auth/refresh`), stores it in `localStorage`, and
manually attaches it as `Authorization: Bearer <token>` on every request.

We are migrating the access token to an **httpOnly cookie**, set directly by
this backend via `Set-Cookie`, exactly mirroring how the refresh token cookie
already works today (that one already works cross-site in production, so we
are not introducing a new class of risk — just applying the same recipe to a
second cookie).

After this change, the frontend will:
- Stop reading/writing any token to localStorage.
- Stop sending an `Authorization` header on any request.
- Rely entirely on the browser automatically attaching cookies (it already
  sends `withCredentials: true` / `credentials: "include"` on every request).

**This means every protected endpoint's auth middleware must be able to
authenticate purely from the incoming cookie.** No request will carry an
`Authorization` header after the frontend migration deploys (see rollout
notes at the end — there is a transition window where both are accepted).

## What needs to change

### 1. Find how the refresh-token cookie is currently set

Locate the code that sets the existing httpOnly refresh-token cookie (likely
in the login and/or refresh route handlers). Note its exact `res.cookie(...)`
options — name, `httpOnly`, `secure`, `sameSite`, `path`, `domain` (if any),
`maxAge`. **Mirror these exact attributes** for the new access-token cookie,
changing only the cookie name and the `maxAge` (see point 3). This cookie
already survives cross-site (Vercel frontend origin ↔ Render backend origin)
in production today, so whatever configuration makes that work is the
configuration to copy — don't reinvent it.

### 2. `POST /api/auth/google-login`

Currently returns:
```json
{ "token": "<jwt>", "user": { "email": "...", "role": "..." } }
```

Change to: set the access token as an httpOnly cookie via `Set-Cookie` in
the same response, using the same cookie attributes as the refresh-token
cookie (see point 1), with attributes:
- `httpOnly: true`
- `secure: true` (required in production; cookie will not be set/sent
  cross-site over plain HTTP)
- `sameSite: "none"` (required because Vercel and Render are different
  registrable domains — this is a cross-site request from the browser's
  perspective; `sameSite: "none"` requires `secure: true` to be honored by
  browsers)
- `maxAge`: set to match the JWT's own expiry (e.g., if the access token is
  signed with `expiresIn: "15m"`, set `maxAge: 15 * 60 * 1000`). Do not let
  the cookie outlive the token it carries, and don't make it shorter either
  (that would log users out before their token actually expires, forcing an
  unnecessary refresh).
- Cookie name: pick something distinct from the refresh-token cookie's name
  (e.g., `accessToken` vs whatever the refresh cookie is currently called),
  since both will now be present on the client simultaneously.

Response body: remove `token` from the JSON body (or see "Transition period"
below if you want a fallback window). Keep `user: { email, role }` in the
body — the frontend still needs this to populate its UI state after login.

### 3. `POST /api/auth/refresh`

Currently returns `{ "token": "<jwt>" }` after validating the refresh-token
cookie and issuing a new access token.

Change to: same as login — `Set-Cookie` the new access token with the same
attributes as point 2, and remove `token` from the response body (the
frontend's refresh flow, after migration, doesn't need the value — it just
needs the cookie to be set so the retried request picks it up automatically).

### 4. `GET /api/auth/verify-token`

Must now authenticate **purely from the incoming cookie** — no
`Authorization` header will be sent by the migrated frontend. Update the
auth middleware used by this route (and by every other protected route — see
point 6) to read the JWT from `req.cookies.<accessTokenCookieName>` instead
of (or in addition to, during transition — see below) parsing
`Authorization: Bearer <token>`. Response body contract is unchanged:
`{ email, role }`.

Practical note: this almost certainly means your Express app needs
`cookie-parser` (or equivalent) middleware already registered globally if
it isn't already (it likely already is, to read the refresh-token cookie on
the refresh route) — reuse that same parsing setup for this cookie too.

### 5. `POST /api/auth/logout`

Must now clear **both** cookies (refresh token, which it presumably already
clears, and the new access-token cookie). Use `res.clearCookie(name, {
httpOnly, secure, sameSite, path })` — the options passed to `clearCookie`
must match the options used when the cookie was **set**, or some browsers
will silently fail to clear it. Response body contract unchanged (frontend
doesn't inspect it).

### 6. Every other protected route/middleware

Any Express middleware that currently does
`req.headers.authorization?.split(" ")[1]` (or similar) to extract the JWT
must be updated to read from the cookie instead. If there's a single shared
`authenticate` / `requireAuth` middleware used across all protected routes
(recommended pattern, and likely already the case), this is a single change
point. If JWT extraction logic is duplicated across multiple route files,
all of them need the same update — grep the codebase for
`req.headers.authorization` or `Bearer` to find every call site.

### 7. CORS configuration — critical, must be exact

Cookies will not be sent or accepted cross-site unless CORS is configured
correctly. Verify (or set) in your CORS middleware (e.g. the `cors` npm
package config):

```js
app.use(cors({
  origin: "https://<your-exact-vercel-frontend-domain>", // NOT "*", NOT a function returning "*"
  credentials: true,
}));
```

- `Access-Control-Allow-Credentials: true` must be present on every response
  the browser will read cookies from (including preflight `OPTIONS`
  responses).
- `Access-Control-Allow-Origin` **must be an explicit origin, not `*`**.
  A wildcard origin is incompatible with `credentials: true` per the Fetch/
  CORS spec — browsers will reject the response and no cookie will be usable.
  If you support multiple frontend origins (e.g. preview deployments on
  Vercel plus the production domain), use a dynamic origin-echo function that
  validates against an allowlist rather than returning `*`.
- If the refresh-token cookie already works cross-site in production today,
  your CORS config already satisfies this for that cookie — verify the same
  config applies to all routes that will now also rely on the access-token
  cookie (i.e., don't have a narrower CORS policy scoped only to the
  refresh route).

### 8. Transition period (recommended, see rollout section for why)

During the coordinated rollout, ship the backend changes so it does **both**
old and new simultaneously:
- Continues to return `token` in the JSON body on login/refresh **and**
  sets the new httpOnly cookie.
- Auth middleware accepts **either** a valid `Authorization: Bearer <token>`
  header **or** a valid cookie — try the cookie first, fall back to the
  header if no cookie is present (or vice versa; order doesn't matter much
  since only one will be present depending on which frontend build made the
  request).

This lets the backend deploy first without breaking the currently-live
frontend (which still expects `token` in the body and still sends
`Authorization`). Once the frontend has migrated and is confirmed working
against the new cookie, the backend can remove the `token` field from
response bodies and remove the `Authorization` header fallback in a
follow-up deploy.

## Summary of endpoints touched

| Endpoint | Change |
|---|---|
| `POST /api/auth/google-login` | Set-Cookie access token (httpOnly/secure/sameSite=none); stop returning `token` in body (after transition) |
| `POST /api/auth/refresh` | Same Set-Cookie change; stop returning `token` in body (after transition) |
| `GET /api/auth/verify-token` | Auth middleware must accept cookie-based auth |
| `POST /api/auth/logout` | Must `clearCookie` both the refresh cookie (existing) and the new access-token cookie, with matching options |
| All other protected routes | Shared auth middleware must read JWT from cookie, not (only) `Authorization` header |
| CORS config | Explicit origin allowlist (no wildcard) + `credentials: true`, applied globally |

## Rollout order (coordinated with the frontend repo)

1. **Backend ships first, in dual-mode** (section 8 above). Deploy to Render.
   The currently-live frontend keeps working unchanged.
2. **Verify the backend in isolation** before the frontend touches it: confirm
   `Set-Cookie` appears on login/refresh with `Secure`, `HttpOnly`,
   `SameSite=None`, and that `GET /api/auth/verify-token` succeeds using only
   the cookie (no `Authorization` header) — e.g. via browser devtools or
   `curl -b`.
3. **Frontend migrates and deploys** (handled in the `niv0-web` repo).
4. **Smoke-test in production**: login, confirm no `Authorization` header in
   the Network tab, session survives a hard refresh, refresh-and-retry works,
   logout clears both cookies.
5. **Backend removes the fallback** (stop returning `token` in bodies, stop
   accepting `Authorization`) only once step 4 is confirmed stable.

## Not in scope

- The refresh-token cookie's own mechanics are unchanged — this migration
  only adds a second cookie for the access token, modeled on the first.
- No changes to JWT signing, claims, or expiry duration are needed — only
  where the token is transported.
