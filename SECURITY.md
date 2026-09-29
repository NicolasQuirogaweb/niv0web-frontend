# Security

## Reporting

If you find a vulnerability, write to nquirogawebdev@gmail.com instead of opening a public issue.

## Resolved

- **Token and role in `localStorage`:** the session now lives in httpOnly cookies set by the API. The frontend doesn't read or store tokens, and the role comes from `GET /api/auth/verify-token`. See [the backend ADR](https://github.com/NicolasQuirogaweb/niv0web-backend/blob/main/docs/decisions/0001-httponly-cookies.md).
- **`.env.vercel` committed by mistake** (commit `a5f19d1`, untracked in `765e72f`). It contained the public backend URL and a `VERCEL_OIDC_TOKEN`. Those tokens are valid for 12 hours, and this one expired on 2026-06-06, the day after it was generated. Nothing needs rotating. `.env.vercel` is in `.gitignore`.
