# Security

## Reporting

If you find a vulnerability, write to nquirogawebdev@gmail.com instead of opening a public issue.

## Known issues

### `VERCEL_OIDC_TOKEN` in git history

Commit `765e72f` stopped tracking `.env.vercel`, but the file (with a `VERCEL_OIDC_TOKEN`) is still in the history. Untracking a file doesn't invalidate a secret that was already committed.

**Pending:** rotate the token in the Vercel project settings. After that, the value left in the history is harmless.

## Resolved

- **Token and role in `localStorage`:** the session now lives in httpOnly cookies set by the API. The frontend doesn't read or store tokens, and the role comes from `GET /api/auth/verify-token`. See [the backend ADR](https://github.com/NicolasQuirogaweb/niv0web-backend/blob/main/docs/decisions/0001-httponly-cookies.md).
