# 0011 — Lower-third section menu on both homes

**Status:** accepted · **Date:** 2026-11 · **Supersedes:** [0005](0005-console-style-home-menu.md)

## Context

The console-style menu (ADR 0005: amber orb, ring, 3D bars and lines) worked, but Nicolás felt it was too artificial. He wanted something more minimal or with more personality.

We went through 30 mockups in several rounds:
- typographic, ink, cassette, mixing desk;
- split-flap board, piano roll, neon, album back cover;
- step sequencer, sampler pads, record crate, pure type;
- arrangement view, turntable, radio dial, stickers;
- four analog-synth panels;
- five options built to sit over the background video.

He liked the piano roll and we tried it on the real home. It covered the whole background video and looked too much like FL Studio, down to its default colors, so it was dropped. The lesson was that the menu has to leave the video free and has to look like niv0, not like a program.

He picked option **U, the lower third**, from the "over the video" round.

## Decision

- **One component, `LowerThirdMenu`, used by both homes.** It replaces `ConsoleMenu`, which is deleted. `OrbRing` stays, because the catalog console (ADR 0010) still uses it. The sections, their order and each one's subtitle (`subKey`) live in `src/content/sections.js`.
- **Layout:** like the credits of a music video ("artist — track"), bottom-left. It has three lines:
  - the selected section's name, very big in white;
  - a short amber line followed by its subtitle;
  - a row with the five sections, each numbered 01–05 in amber.

  The rest of the screen is left to the background.
- **Motion:** when the selection changes, the letters of the big name rise one after another (25 ms apart) and the amber line draws itself. With `prefers-reduced-motion`, both appear without animation.
- **Always one section selected**, starting with the first. The mouse, keyboard focus or the arrows move the selection, and Enter opens it. The row is horizontal, so ← → move it as well as ↑ ↓, and both wrap around. As before (ADR 0008), the arrows work as soon as the page opens, and they stay with any text field or other control that has focus. The state is exposed as `data-active`.
- **Accessibility:** the row is a `<nav>` named by `home.menuLabel`, with a list of real links.
  - The numbers come from a CSS counter, so each link's name is only the section.
  - The big name is also a link to the selected section, as a mouse shortcut. It is `aria-hidden` and `tabIndex={-1}`, so screen readers and Tab only see the row. The subtitle is `aria-hidden` too.
- **Subtitles (Claude's call, Nicolás can change them):**

  | Section | ES | EN |
  |---|---|---|
  | Beats | Escuchá el catálogo | Hear the catalog |
  | Sample packs | Gratis · descarga en ZIP | Free · ZIP download |
  | Loops | Loops para tus temas | Loops for your tracks |
  | NIV0 | La historia | The story |
  | Prod mix master | Producción, mezcla y master | Production, mix and master |

  Beats don't promise licenses yet, because the store isn't live.

## Consequences

- The homes' header, call to action, admin button, Instagram link and backgrounds don't change. The menu sits at the bottom of the content column (`margin-top: auto`), right above them.
- Adding or renaming a section still happens only in `sections.js` and both language files. A new section also needs its subtitle.
- The mockups are in `.superpowers/brainstorm/` and are not part of the build.
