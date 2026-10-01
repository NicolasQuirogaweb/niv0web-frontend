---
name: add-page
description: Add a new page to the niv0web frontend with its lazy route, guard, i18n keys in both languages, SEO tags and a test. Use when asked to create a new screen or section in the React app.
---

# Adding a page

1. **Component** in `src/components/` (or `components/admin/` for the admin panel). Look at `Loops.js` for a simple private page:
   - `<SEO title description />` first.
   - `<PageHeader className="..." />` for private pages.
   - Data through a function in `services/api.js` plus `usePublicResource`, handling `loading`, `error` and the empty state.
2. **Route** in `src/routes/MyRoutes.js` using `lazyNamed`. Wrap it in `<PrivateRoute>` if it needs a session. Admin pages go inside the `/admin` route and get an entry in `navItems` in `AdminLayout.js`.
3. **Texts.** Add a section to `src/i18n/es.json` **and** `en.json` with the same keys, including `seoTitle` and `seoDesc`. Check that both files still have the same number of keys:
   `node -e "const c=o=>Object.values(o).reduce((a,v)=>a+(typeof v==='object'?c(v):1),0);console.log(c(require('./src/i18n/es.json')),c(require('./src/i18n/en.json')))"`
4. **Link** to it from wherever it belongs (`HomeLogued.js`, the sidebar...).
5. **Test** next to the component (`Name.test.js`). Mock `../services/api` and `../hooks/useAuth` as in `Playlist.test.js`, and assert that it renders the data and calls the correct service.
6. `npm run lint` and `CI=true npm test -- --watchAll=false`.

If the page needs a new endpoint, say so in the summary: it belongs in the backend repo.
