"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { BackToMenu } from "@/components/BackToMenu";
import { HUB_SIZES } from "@/lib/player-config";

/** Never hold the page black longer than this, even if the frame never loads. */
const REVEAL_TIMEOUT_MS = 3000;

/**
 * The snow lasts as long as the video takes to start, between these two
 * bounds: never a flash, never a hang. The embed is mounted *underneath* the
 * snow, so the loading happens during the noise rather than after it.
 */
const MIN_STATIC_MS = 700;
const MAX_STATIC_MS = 5000;

/**
 * The dial cycles through these in order and wraps. There is deliberately no
 * channel number on screen: the only way to know what is on is to turn the
 * knob and watch.
 *
 * `id` is the YouTube video id — the part after `v=` in a watch URL.
 */
const CHANNELS = [
  { id: "rTYdjkZaPh0", label: "Channel 1" },
  { id: "9vqVzGTkRU4", label: "Channel 2" }, // Fallcore — Velith
];

/**
 * The two balls painted at the bottom corners of `tv_frame.png`: play on the
 * left, next on the right. Restored from commit 3629004, which is the only
 * version of the frame that has them.
 *
 * Percentages are of the container, not of the image. The container is
 * portrait (900×1260) while the frame art is landscape, so `object-fit:
 * contain` letterboxes it into the middle ~54% of the height — which is why
 * the vertical numbers look large for something sitting near the bottom of
 * the picture.
 */
const PLAY_BALL = { left: "3%", top: "69.5%", width: "12%", height: "8%" };
const NEXT_BALL = { left: "81.5%", top: "69.5%", width: "13.5%", height: "8%" };

/** Shared by both balls; only the rectangle differs. */
const BALL_STYLE: CSSProperties = {
  position: "absolute",
  zIndex: 300,
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
};

/** Geometry of the picture inside the frame. The static must match it exactly. */
const SCREEN: CSSProperties = {
  width: "80%",
  height: "54%",
  transform: "translateX(3%) rotateY(20deg)",
};

/** Wraps a child in the same centred, clipped box the picture sits in. */
const layer = (zIndex: number, clickable = false): CSSProperties => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  zIndex,
  ...(clickable ? null : { pointerEvents: "none" as const }),
});

export default function VideoPage() {
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const [channel, setChannel] = useState(0);
  /** True while the screen is showing snow. */
  const [tuning, setTuning] = useState(false);
  /**
   * The set is off until the play ball is pressed. That press is not only
   * staging: an unmuted embed will not start without a real user gesture, so
   * the dark screen is what buys the right to autoplay — and the visitor
   * never sees YouTube's red play button.
   */
  const [on, setOn] = useState(false);

  const staticCanvas = useRef<HTMLCanvasElement | null>(null);
  const embed = useRef<HTMLIFrameElement | null>(null);

  const audioCtx = useRef<AudioContext | null>(null);
  const noise = useRef<{ src: AudioBufferSourceNode; gain: GainNode } | null>(null);

  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The floor has passed, so the snow may end as soon as the picture is up. */
  const minElapsed = useRef(false);
  /** The player has reported PLAYING for the channel now being tuned. */
  const pictureUp = useRef(false);
  /** False when switching the set off — there is no picture to wait for. */
  const awaitingPicture = useRef(false);

  // Continues the hub's fade-to-black: arrive black, then reveal once the TV
  // frame is up, instead of showing a half-built page. The embed is not part
  // of the gate — it does not exist until the set is switched on.
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), REVEAL_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const ready = frameLoaded || timedOut;

  // ---------- SNOW, THE SOUND ----------

  /** A bed of filtered white noise, held for as long as the snow is up. */
  const startNoise = useCallback(() => {
    type WithWebkit = typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as WithWebkit).webkitAudioContext;
    if (!Ctx) return;

    if (!audioCtx.current) audioCtx.current = new Ctx();
    const ctx = audioCtx.current;
    if (ctx.state === "suspended") void ctx.resume();

    // One second of noise, looped — cheaper than generating the whole bed, and
    // indistinguishable once it is this dense.
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    // Rolls the harshest top off, so it reads as a speaker rather than a hiss.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 5200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.05);

    src.connect(lp).connect(gain).connect(ctx.destination);
    src.start();
    noise.current = { src, gain };
  }, []);

  const stopNoise = useCallback(() => {
    const ctx = audioCtx.current;
    const n = noise.current;
    if (!ctx || !n) return;
    noise.current = null;

    const t = ctx.currentTime;
    n.gain.gain.cancelScheduledValues(t);
    n.gain.gain.setValueAtTime(n.gain.gain.value, t);
    n.gain.gain.linearRampToValueAtTime(0, t + 0.12);
    n.src.stop(t + 0.15);
  }, []);

  // ---------- SNOW, THE SEQUENCE ----------

  const endTuning = useCallback(() => {
    if (minTimer.current) clearTimeout(minTimer.current);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    stopNoise();
    setTuning(false);
  }, [stopNoise]);

  /** Ends the snow once both the floor has passed and the picture is up. */
  const maybeEnd = useCallback(() => {
    if (!minElapsed.current) return;
    if (awaitingPicture.current && !pictureUp.current) return;
    endTuning();
  }, [endTuning]);

  const beginTuning = useCallback(
    (waitForPicture: boolean) => {
      minElapsed.current = false;
      pictureUp.current = false;
      awaitingPicture.current = waitForPicture;

      setTuning(true);
      startNoise();

      if (minTimer.current) clearTimeout(minTimer.current);
      if (maxTimer.current) clearTimeout(maxTimer.current);
      minTimer.current = setTimeout(() => {
        minElapsed.current = true;
        maybeEnd();
      }, MIN_STATIC_MS);
      maxTimer.current = setTimeout(endTuning, MAX_STATIC_MS);
    },
    [startNoise, maybeEnd, endTuning]
  );

  /**
   * The play ball. Warms the set up on whatever channel it was left on, and
   * kills it again on a second press — unmounting the embed is also the only
   * reliable way to stop its sound.
   */
  const togglePower = useCallback(() => {
    if (tuning) return;
    if (on) {
      setOn(false);
      beginTuning(false);
    } else {
      setOn(true);
      beginTuning(true);
    }
  }, [tuning, on, beginTuning]);

  /** Turn the dial: snow, and when it clears the next channel is simply there. */
  const turnDial = useCallback(() => {
    if (tuning) return;
    setChannel(c => (c + 1) % CHANNELS.length);
    setOn(true);
    beginTuning(true);
  }, [tuning, beginTuning]);

  // ---------- TALKING TO THE EMBED ----------

  // With `enablejsapi=1` the player answers a "listening" handshake with state
  // updates. That is how the snow knows the picture is actually up, rather
  // than guessing with a fixed delay.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data !== "string") return;
      if (!e.origin.includes("youtube.com")) return;
      try {
        const msg = JSON.parse(e.data);
        // 1 is PLAYING in the IFrame API's state enum.
        if (msg?.info?.playerState === 1) {
          pictureUp.current = true;
          maybeEnd();
        }
      } catch {
        // The player also sends things that are not JSON. Nothing to do.
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [maybeEnd]);

  const post = (func: string) =>
    embed.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*"
    );

  const onEmbedLoad = useCallback(() => {
    // Opens the event channel the listener above depends on.
    embed.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
      "*"
    );
    // YouTube honours `autoplay=1` off the back of the press in most browsers,
    // but not all — iOS in particular can ignore a gesture delegated into a
    // cross-origin frame. Nudging recovers those cases and is otherwise a
    // no-op.
    setTimeout(() => {
      post("playVideo");
      post("unMute");
    }, 400);
  }, []);

  // Closing the context on unmount, for the same reason the hub does: a bed
  // left running keeps playing over the next page.
  useEffect(() => {
    return () => {
      if (minTimer.current) clearTimeout(minTimer.current);
      if (maxTimer.current) clearTimeout(maxTimer.current);
      audioCtx.current?.close();
      audioCtx.current = null;
    };
  }, []);

  // ---------- SNOW, THE PICTURE ----------

  // Drawn at a low resolution and scaled up by the canvas itself, which is
  // both cheaper and coarser — closer to analogue snow than per-pixel noise.
  useEffect(() => {
    if (!tuning) return;
    const canvas = staticCanvas.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const W = (canvas.width = 160);
    const H = (canvas.height = 120);
    let frame = 0;

    const draw = () => {
      const img = ctx.createImageData(W, H);
      const px = img.data;
      for (let i = 0; i < px.length; i += 4) {
        const v = Math.random() * 255;
        px[i] = px[i + 1] = px[i + 2] = v;
        px[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(frame);
  }, [tuning]);

  const current = CHANNELS[channel];
  // `enablejsapi` exists only so the handshake above can be received.
  const params =
    "controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1&autoplay=1&enablejsapi=1";

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        background: "#19191b",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "black",
          opacity: ready ? 0 : 1,
          pointerEvents: "none",
          transition: "opacity 0.6s ease",
          zIndex: 900,
        }}
      />

      <BackToMenu />

      {/* === SIZE LIKE THE MENU BACKGROUND (same logic) === */}
      <div
        style={{
          position: "relative",
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",
          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* === THE PICTURE === */}
        <div style={layer(20, true)}>
          {/* Remounting on the channel is what actually swaps the video: the
              embed ignores a changed `src` once it has booted. It mounts the
              moment the set is switched on — i.e. behind the snow — so the
              load happens during the noise instead of after it. */}
          {on && (
            <iframe
              ref={embed}
              key={current.id}
              src={`https://www.youtube.com/embed/${current.id}?${params}`}
              title={current.label}
              onLoad={onEmbedLoad}
              allow="autoplay; encrypted-media; picture-in-picture"
              style={{ ...SCREEN, border: "none" }}
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* === GLASS === */}
        {/* A transparent sheet over the picture, so the pointer never reaches
            the embed. Without it, moving the mouse across the screen wakes
            YouTube's own play/pause overlay and title bar, which breaks the
            illusion that this is a television. */}
        {on && (
          <div aria-hidden style={layer(60, true)}>
            <div style={{ ...SCREEN, cursor: "default" }} />
          </div>
        )}

        {/* === THE DEAD SCREEN === */}
        {/* Black glass while the set is off, and behind the snow while it
            warms up. Not itself pressable: the play ball painted into the
            frame is the way in. */}
        {(!on || tuning) && (
          <div aria-hidden style={layer(80)}>
            <div style={{ ...SCREEN, background: "#000" }} />
          </div>
        )}

        {/* === SNOW, over the picture and under the frame === */}
        {tuning && (
          <div aria-hidden style={layer(100)}>
            <canvas ref={staticCanvas} style={{ ...SCREEN, opacity: 0.85 }} />
          </div>
        )}

        {/* === PNG FRAME OVERLAY === */}
        <Image
          src="/next/image/tv_frame.png"
          alt="TV Frame"
          fill
          sizes={HUB_SIZES}
          priority
          onLoad={() => setFrameLoaded(true)}
          onError={() => setFrameLoaded(true)}
          style={{
            objectFit: "contain",
            objectPosition: "center",
            pointerEvents: "none",
            zIndex: 200,
          }}
        />

        {/* === THE TWO BALLS === */}
        {/* Invisible, like every other control in the project: they sit on the
            symbols already painted into the frame. */}
        <button
          type="button"
          aria-label={on ? "Turn the television off" : "Turn the television on"}
          tabIndex={-1}
          onClick={togglePower}
          style={{ ...BALL_STYLE, ...PLAY_BALL }}
        />
        <button
          type="button"
          aria-label="Next channel"
          tabIndex={-1}
          onClick={turnDial}
          style={{ ...BALL_STYLE, ...NEXT_BALL }}
        />
      </div>
    </main>
  );
}
