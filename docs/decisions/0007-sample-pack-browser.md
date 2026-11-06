# 0007 — Sample pack browser instead of per-sample downloads

**Status:** accepted · **Date:** 2026-11

## Context

Sample packs were a flat list of samples, each with its own download button, and the packs had no price or publishing state. Nicolás wants packs to behave like real products: folders, a showcase, one download for the whole pack, and room for paid packs later.

## Decision

- **Showcase** at `/samplepacks` (the catalog console, ADR 0010): each pack shows folders, samples count and a GRATIS or price tag. Only published packs appear.
- **Browser** on `/samplepacks/:slug`: an FL Studio-style tree of folders and samples you can walk with the keyboard and audition. It has a now-playing bar and **deliberately no per-sample download**: the pack is the product, and the only way to take the audio is the ZIP.
- **FL PRO window** (revised 2026-11, chosen by Nicolás from three mockups): the browser is a DAW window. A title bar with lights and the pack stats (folders · samples · ZIP size); a screen driven by the **selection**, folder or sample, by click or keyboard focus (falls back to what is playing, then to an idle line), showing the path, the name big, the sample count or duration, and a decorative waveform seeded from the sample so each one keeps its shape, filling amber while that sample plays (`role="progressbar"`); a search box that filters samples by title ignoring case and accents, opens the folders with matches and hides the rest, and clears with Esc without leaving the page; and a footer with the keys. Search never changes the player index, which stays the sample's position in the whole pack. Durations show tenths under 10 s ("2.4 s", one-shots are short) and m:ss from there. The pack description can come in English too (`descriptionEn`, optional, falls back to Spanish).
- **ZIP**: the admin builds it with a button ("Armar ZIP"). The API builds it in the background and the panel polls `onRefresh` every 5 s only while the status is `building`. The page downloads it straight from B2. After any edit that changes the contents the API marks it `stale` and the panel warns "Hay cambios: volvé a armar el ZIP".
- **Admin**: `AdminSamplePackForm` (free checkbox, ARS and optional USD price, published), `AdminPackFolders` (add, rename, reorder, delete when empty), `AdminZipPanel`, and a required folder on every sample, single or batch (preselected when the pack has one folder). Samples move between folders from the list.
- **Paid packs stay unpublished** until the store exists: the API answers 409 `PACK_PAID_NOT_SELLABLE`, and an empty pack cannot be published (`PACK_EMPTY`). The form shows those as messages.
- Sample packs no longer go through `AdminPlaylistForm`.

## Consequences

- If the ZIP is not rebuilt after edits, visitors get the old one; the stale warning is the only guard.
- Per-sample audio files are still reachable by whoever inspects the player's network requests; the browser removes the button, not the access.
