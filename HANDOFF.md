# migu.port — handoff

State of the project as of 2026-08-09. Written so a fresh session can pick up
without re-deriving anything.

## What this is

A Next.js 15 (App Router) portfolio for Victor Clavelly's music, built as an
interactive "machine": full-frame PNG artwork with **invisible hotzones** laid
over the painted buttons. There is no CMS and no database — all content is
hardcoded arrays.

## Routes

| Route | File | What it is |
|---|---|---|
| `/` | `src/app/page.tsx` | The music player. Splash → intro overlay → 4 albums, 6 painted buttons. |
| `/hub` | `src/app/hub/page.tsx` | The `carsnew.png` room. Hover zones with sound + Web Audio ambient bed. |
| `/cv` | `src/app/cv/page.tsx` | `cars.png` page. **Orphaned** — nothing links here since the hub's CV zone was pointed at igordubreucq.com. |
| `/tv` | `src/app/tv/page.tsx` | `tv_frame.png` around a YouTube embed. |

Navigation between them: `i` (keyboard) or the invisible top-left button on the
player → `/hub`. Hub zones → `/`, `/tv`, igordubreucq.com. `/tv` → `/hub` via a
visible `← Menu` button.

## Architecture

```
src/
  app/
    page.tsx            player, composition only (~400 lines)
    hub/page.tsx        hub, incl. Web Audio graph
    cv/page.tsx  tv/page.tsx
    layout.tsx          metadata + viewport export, Cinzel via next/font
    globals.css         no-select rules, no focus rings, .back-to-menu
  components/
    player/             Splash, ImageOverlay, ButtonHotzone, HiddenPreload
    BackToMenu.tsx  DustOverlay.tsx
  hooks/
    usePlayer.ts        sole owner of the <audio> element
    useHubShortcut.ts   the "i" key, nothing else
  data/projects.ts      albums, playlists, hotzone coords, BTN name constants
  lib/player-config.ts  FRAME_SIZES, HUB_SIZES, Z layer map, preload lists
```

## Things that will bite you if you don't know them

**`usePlayer` owns `audio.src` exclusively.** The `<audio>` tag has **no `src`
prop**. Callers move `trackIdx`; one effect reacts. This replaced a version
where `src` was set both as a React prop and imperatively, which needed a 30ms
`setTimeout` to race React's commit. Don't reintroduce a `src` prop.

**`isPlaying` comes from real media events**, not from which button was last
clicked. That is why the Play button lights up correctly after an auto-advance.
`pressedIdx` is only momentary feedback for the non-play/pause buttons.

**Asset paths are case-sensitive in production.** Windows dev hides this.
`Button5On.png` vs `Button5ON.png` was a live 404 on Vercel for months.

**`sizes` must match everywhere an image is rendered**, including
`HiddenPreload`. A differing `sizes` produces a different srcset and therefore a
second download of the same picture. `FRAME_SIZES` for the player box,
`HUB_SIZES` for the 900px hub box.

**Hub hotzone percentages are of the container, not the image.** The container
is portrait (900×1260) but `carsnew.png` is landscape, so `object-fit: contain`
letterboxes it into the middle ~54% of the height. Vertical numbers look
compressed for this reason. `DustOverlay` recomputes the same rect to clip to.

**The hub's ENTER gate only exists to obtain a user gesture** for the
`AudioContext`. It is skipped when `navigator.userActivation.hasBeenActive` is
true (client-side nav) or `sessionStorage["hub:entered"]` is set. Don't "fix"
it by removing the gate outright — a cold load genuinely needs it.

**The hub `AudioContext` is closed on unmount.** Without that, leaving via the
browser back button left the ambient loop audibly playing over the next page.

**Exit fade is 300ms but navigation waits 600ms.** Deliberate: the screen must
be solid black *before* the next page mounts, and 600ms matches the audio gain
ramp. `EXIT_FADE_MS` / `NAVIGATE_DELAY_MS` in `hub/page.tsx`.

## Deliberate design decisions (do not "improve" these)

- **No keyboard controls** beyond `i`. Space/arrows/Escape were removed at the
  owner's request; hotzones are `tabIndex={-1}`.
- **No focus rings, no text selection, no image drag.** Global rules in
  `globals.css`. This makes the player mouse/touch-only by choice.
- The hub button on the player sits at `Z.hubButton = 10006`, above every
  overlay, because the project page is open on load and a zone underneath it
  would be untappable on a phone.

## Verifying changes

There is no test suite. Verification has been done by driving a real Chrome
with Playwright (installed ad-hoc in the scratchpad, using `channel: 'chrome'`
so no browser download). Pattern that works:

```js
await page.goto('http://localhost:PORT/');
await page.waitForFunction(() => document.querySelector('[role="progressbar"]')
  ?.getAttribute('aria-valuenow') === '100');
await page.getByRole('button', { name: 'Enter the player' }).click();
```

Always `npx next build` before trusting anything — `next lint` and `tsc
--noEmit` both pass clean today.

## Media pipeline

All audio was re-encoded from 320 kb/s CBR to LAME VBR: **V4** for music,
**V6** for `Ambient.mp3`. 150 MB → 67 MB. Any new track should get the same
treatment. ffmpeg is not installed system-wide; it was pulled in as the
`ffmpeg-static` npm package inside the scratchpad.

`carsnew.png` was colour-graded once and **reverted** — the owner wants real
set dressing (dust, cracked plinth, broken glass), not a grade. Cracks and
broken glass are not achievable in post here and belong in the source 3D scene.
Dust was solved instead as `DustOverlay` (canvas particles), which is tunable
via its `count` prop and the `r` / `a` / `vx` / `vy` values in `spawn()`.

## Open items

- **Page title** is "The migu Player" (`layout.tsx`). A dead `next/head` in the
  old player said "Victor Clavelly". Owner has not chosen.
- **Unreferenced assets**: `CV.png`, `rahg.png` (6 MB). `home2.png` is used
  only by the orphaned `/cv`.
- **`/cv` is orphaned** — keep as a hidden page, or delete?
- **Dependency advisories**: 12 from `npm audit`, one critical (`tar`), plus a
  Next security advisory for 15.3.6. Not actioned; the Next bump wants its own
  test pass.
- `src/lib/utils.ts` + `clsx` + `tailwind-merge` are unused, kept only so a
  future `npx shadcn add` still works.

## Owner working style

Commits frequently and directly to `master` (often mid-session, with short
messages like "ag", "bup"). Check `git log` before assuming your changes are
uncommitted. Prefers being shown a verified result over being asked to confirm
plans, but wants to choose anything subjective or visual.
