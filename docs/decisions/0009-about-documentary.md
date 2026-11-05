# 0009 — NIVØ page as a documentary

**Status:** accepted · **Date:** 2026-11

## Context

The About page (`/about`, shown as NIVØ) was a centered block of text and a grid of records. Nicolás wanted it with more life: a background video, the story better designed, livelier record animations. Two things also didn't work well:

- Opening a record (click or Enter) showed Spotify's standard embed, and nothing played until you pressed play inside it.
- There was no place to announce his upcoming album, *Sentimientos restringidos* (November 2026).

From three mockups (documentary, cinematic, LP back cover) he chose **documentary**.

## Decision

- **Hero:** the section video fills the top (`PageBackground` with `contained`, which fades into the page at the bottom), with the top bar over it, "Artista y productor · Villa Mercedes, San Luis" and NIVØ huge in worn ink. No genre tags (Nicolás asked to drop them).
- **Quote and story:** "La música se hace con el corazón y no con la cabeza" in big letters with *corazón* in amber, then the story in two columns with a drop cap, one column on phones. Paragraphs fade up as they reach the screen (`IntersectionObserver`; without it, everything shows). The last paragraph now ends at "INSPIRAR" (his edit).
- **Upcoming album:** `UPCOMING_RELEASE` in `src/content/about.js` drives `UpcomingRelease`. It fills in as data arrives:
  - `month` only: "Sale en noviembre", with a sleeve in shadow and a record peeking out.
  - `releaseDate`: the exact day and a countdown (days, hours, minutes).
  - `coverUrl` and `presaveUrl`: the cover and a pre-save button.
  - After the date (or the end of the month without a date) the block hides itself; the album then shows up in the discography from Spotify.
- **Records:** `RecordCrate` replaces `VinylGrid`. The records stand in a crate like in a record shop; the one you point at (mouse, focus or the arrows from ADR 0008) lifts out and faces you. Picking it drops it on a turntable: the record falls, the arm comes down, it spins and plays.
- **Playback:** `SpotifyPlayer` uses Spotify's iFrame API (`src/utils/spotifyEmbed.js`) to load the album and call `play()`, so picking a record starts it. Plays still count on Spotify. Limits that don't depend on us: a browser may block sound the first time (then you press play once), and without a Spotify session Spotify plays 30-second previews. If the API script can't load (blockers), the standard embed is shown.
- **Video:** until Nicolás sends his own, the hero uses the home video (`ABOUT_BACKGROUND`). To swap it: `scripts/encode-background.sh`, upload to B2 `backgrounds/`, paste the URLs.
- **Keyboard:** records are `data-nav-item`; Esc goes back home (there is no open record to close any more).
- Reduced motion: no rise, no fade-ups, no spinning, no arm movement.

## Consequences

- `VinylGrid` and its tests are gone; `about.close` is no longer used.
- The album announcement is edited in one file and needs no deploy logic to expire.
- The page loads Spotify's script only when a record is picked.
