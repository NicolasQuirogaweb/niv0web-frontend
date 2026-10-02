---
name: release-check
description: Checklist to run before merging into main on niv0web-frontend (Vercel deploys main to production). Use when asked to prepare a release, open a PR to main, or check whether the branch is ready to ship.
---

# Release check

1. `npm run lint`, `npm test` and `npm run build`. All three must pass.
2. Read `git diff main...HEAD`. Look for `console.log` calls, visible text that doesn't go through i18n, and secrets.
3. **i18n:** `es.json` and `en.json` have the same keys (see the command in the add-page skill).
4. **API contract:** if `src/services/api.js` changed, find out whether it needs a backend deploy. If it does, the backend goes first. Tell the user the order.
5. **Env:** a new `VITE_*` variable has to be in `.env.example`, in the README, in `ci.yml` (placeholder) and in Vercel (Production and Preview) before merging.
6. **Docs:** README claims still match (routes, test coverage). Move the Unreleased items in `CHANGELOG.md` under a version.
7. Summarize for the user in 3-5 lines, plus anything they have to do by hand. Don't merge or push yourself.
