---
name: ui-component
description: Build or restyle a visual component of the niv0web frontend in the site's own style (dark, green accent, glass, lift-and-glow hover) using the design tokens, with keyboard/focus, reduced-motion and i18n handled. Use when asked to create or redesign a card, section, page block or any UI element.
---

# Building a UI component in niv0's style

Read `docs/decisions/0003-visual-system.md` first. It explains why things look the way they do.

## Rules
1. **Tokens only.** Colors, radii, shadows, glass and timings come from `src/styles/tokens.css` (`var(--color-accent)`, `var(--glass-bg)`, `var(--radius-lg)`, `var(--dur-med)`...). If a value you need doesn't exist, add a token. Never add another raw `#bbf0be`.
2. **One stylesheet per component**, next to it (`Thing.jsx` + `Thing.css`), with class names prefixed by the component (`.license-card`, `.card-glass`...).
   - Watch out for page-level selectors like `.beats-section h3`. If they leak into your component, raise specificity with `.component .element`. Don't use `!important`.
3. **Hover = lift + glow** (`translateY(-4px…-6px)`, `--shadow-lift`, `--glow-accent`). The same rule always lists `:focus-visible` too.
4. **Motion**
   - Use `transition` with `--ease-out` and `--dur-fast`/`--dur-med`.
   - Every `animation` or `transform` gets a `@media (prefers-reduced-motion: reduce)` block that turns it off or freezes it.
5. **Semantics**
   - A clickable card is a single `<Link>`/`<a>`/`<button>`, never a `div` with `onClick`.
   - Decoration is `aria-hidden="true"`.
   - Status shown with a symbol (✓/✕) also gets an `sr-only` text.
6. **Text**
   - Every visible string is an i18n key, in both `es.json` and `en.json`.
   - Counts use i18next plurals (`key_one`/`key_other`).
   - Data that may come from the API later (prices, lists) lives in `src/content/*.js`, not in JSX.
7. **Mobile**
   - Add a `@media (max-width: 768px)` block.
   - Grids go to 2 columns for cards and 1 column for wide blocks.
   - No horizontal overflow.

## Test it
- **Vitest + Testing Library**, next to the component (`Thing.test.jsx`). Assert what a user perceives:
  - roles and accessible names (`getByRole("article", { name })`, `getByRole("link", { name })`);
  - the texts and values from the spec;
  - `aria-hidden` on decoration.
  - Do **not** assert CSS values.
- **Manual pass** in `npm run dev` before opening a PR:
  - hover and Tab focus;
  - mobile view (F12 → Ctrl+Shift+M);
  - EN/ES switch;
  - with reduced motion on (DevTools → Rendering → "prefers-reduced-motion: reduce").
- `npm run lint && npm test && npm run build`.

## When the look is still undecided
Show options before building. The `superpowers:brainstorming` visual companion renders clickable mockups in the browser. Build only once Nicolás has picked one, and record the choice in an ADR if it sets a new pattern.
