# 0012 — Visitors can pick the site's accent color

**Status:** accepted · **Date:** 2026-11

## Context

Nicolás wanted something interactive on the site, like the preferences window of a DAW: let the visitor change the page color. He asked for it next to the language button, small, and with a polished look.

We showed four mockups: a synth knob, a DAW "Preferences" window, a strip of LEDs and a sampler display. He picked **B, Preferences**.

## Decision

- `ThemePicker` (`src/components/common/ThemePicker.jsx`) sits right after `LanguageSwitcher` everywhere that button appears. That covers both homes, `PageHeader`, About, Login and the admin.
- It is a "COLOR" button with an LED in the current color. It opens a small window with a title bar and six preset colors: amber, red, magenta, cyan, mint and lime. Below them is a fader for any hue, and a readout with the color name, or the degrees if the color is custom.
- **Only the hue changes.** Every color uses amber's saturation and lightness (`hsl(h 87% 69%)`; amber is hue 38), so every choice reads as well as amber does: on the dark background and under the dark text of the accent buttons. Hue 38 gives back exactly `#f5c26b`.
- `src/utils/theme.js` overrides `--color-accent-rgb` and `--color-accent-strong` on `<html>`. The tokens built from those two (soft, line, glow) follow on their own, so no component needs to change. This works because every accent in the site comes from `tokens.css` (ADR 0003).
- The hue is saved in `localStorage` under `accentHue`, and `index.jsx` applies it before the first render so amber doesn't flash first. If storage is blocked, the color lasts until the page reloads.
- Keys stay inside the window: arrows move between the colors, Esc closes it and gives focus back to the button, and the page's keyboard navigation does not react (ADR 0008). A click outside also closes it.

## Consequences

- New colors in the CSS must keep coming from the tokens. A hardcoded amber would not follow the visitor's choice.
- The chosen color lives in that visitor's browser only. It is not tied to the account.
