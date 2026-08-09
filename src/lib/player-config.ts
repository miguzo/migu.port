import { projects } from "@/data/projects";

/**
 * Every image in the player is laid out inside the same box:
 *   width: min(98vw, 430px)
 * Without this, next/image assumes 100vw and serves a far larger candidate
 * than the box can ever display. It must be identical everywhere an image is
 * rendered, including the hidden preloader — a differing `sizes` produces a
 * different srcset and therefore a second download of the same picture.
 */
export const FRAME_SIZES = "(max-width: 439px) 98vw, 430px";

/** The hub / cv / tv pages use a wider box: min(100vw, 900px). */
export const HUB_SIZES = "(max-width: 900px) 100vw, 900px";

/** Layer order, previously scattered as inline magic numbers up to 10005. */
export const Z = {
  glow: 0,
  frame: 2,
  buttons: 11,
  title: 16,
  hotzone: 20,
  pageOverlay: 30,
  splash: 10000,
  mainPage: 10001,
  aboutMe: 10003,
  blackFade: 99999,
} as const;

/**
 * Preloaded through next/image (not `new window.Image()`) so the request is
 * byte-for-byte the one the real render makes. Warming the raw /next/image/...
 * path instead meant every asset was downloaded twice.
 *
 * Blocks the splash: everything needed to show project 0 and the overlays.
 */
export const CRITICAL_IMAGES: string[] = Array.from(
  new Set([
    ...projects.flatMap(p => [p.mainImg, p.pageImg]),
    ...projects[0].buttons.flatMap(btn => [btn.on, btn.off]),
    projects[0].playlist[0].titleImg,
    "/next/image/MainPage.png",
    "/next/image/AboutMe.png",
  ])
);

/**
 * Fetched quietly once the splash is dismissed, so switching project does not
 * pop in mid-fade.
 */
export const DEFERRED_IMAGES: string[] = Array.from(
  new Set([
    ...projects.flatMap(p => p.buttons.flatMap(btn => [btn.on, btn.off])),
    ...projects.flatMap(p => p.playlist.map(t => t.titleImg)),
  ])
).filter(src => !CRITICAL_IMAGES.includes(src));
