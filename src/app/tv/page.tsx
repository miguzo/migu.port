"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { BackToMenu } from "@/components/BackToMenu";
import { HUB_SIZES } from "@/lib/player-config";

/** Never hold the page black longer than this, even if YouTube never loads. */
const REVEAL_TIMEOUT_MS = 3000;

/** How long the screen stays on static before the next channel appears. */
const STATIC_MS = 550;

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
const NEXT_BALL = { left: "83.5%", top: "69.5%", width: "12%", height: "8%" };

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

export default function VideoPage() {
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const [channel, setChannel] = useState(0);
  /** True while the screen is showing static, mid-turn of the dial. */
  const [tuning, setTuning] = useState(false);
  /**
   * The set is off until the play ball is pressed. That press is not only
   * staging: an unmuted embed will not start without a real user gesture, so
   * the dark screen is what buys the right to autoplay — and the visitor
   * never sees YouTube's red play button.
   */
  const [on, setOn] = useState(false);

  const staticCanvas = useRef<HTMLCanvasElement | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const turnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const embed = useRef<HTMLIFrameElement | null>(null);

  // Continues the hub's fade-to-black: arrive black, then reveal once the TV
  // frame is up, instead of showing a half-built page. The embed is no longer
  // part of the gate — it does not exist until the set is switched on.
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), REVEAL_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const ready = frameLoaded || timedOut;

  // Like the hub's ambient bed: the context is closed on unmount, or a burst
  // left mid-decay keeps the page alive after navigating away.
  useEffect(() => {
    return () => {
      if (turnTimer.current) clearTimeout(turnTimer.current);
      audioCtx.current?.close();
      audioCtx.current = null;
    };
  }, []);

  /** A short burst of filtered white noise — the sound of a dial being turned. */
  const playStatic = useCallback(() => {
    type WithWebkit = typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as WithWebkit).webkitAudioContext;
    if (!Ctx) return;

    if (!audioCtx.current) audioCtx.current = new Ctx();
    const ctx = audioCtx.current;
    if (ctx.state === "suspended") void ctx.resume();

    const dur = STATIC_MS / 1000;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;

    // Rolls the harshest top off the noise so it reads as a speaker, not a hiss.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 5200;

    const gain = ctx.createGain();
    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.22, t0 + 0.04);
    gain.gain.setValueAtTime(0.22, t0 + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0, t0 + dur);

    src.connect(lp).connect(gain).connect(ctx.destination);
    src.start();
    src.stop(t0 + dur);
  }, []);

  /** Static for a moment, then whatever the press was meant to do. */
  const burst = useCallback(
    (then: () => void) => {
      if (tuning) return;
      setTuning(true);
      playStatic();

      turnTimer.current = setTimeout(() => {
        then();
        setTuning(false);
      }, STATIC_MS);
    },
    [tuning, playStatic]
  );

  /**
   * The play ball. Warms the set up on whatever channel it was left on, and
   * kills it again on a second press — unmounting the embed is also the only
   * reliable way to stop its sound.
   */
  const togglePower = useCallback(() => burst(() => setOn(o => !o)), [burst]);

  /** Turn the dial: static, then the next channel is simply there. */
  const turnDial = useCallback(
    () =>
      burst(() => {
        setChannel(c => (c + 1) % CHANNELS.length);
        setOn(true);
      }),
    [burst]
  );

  // YouTube honours `autoplay=1` off the back of the press in most browsers,
  // but not all of them — iOS in particular can ignore a gesture delegated
  // into a cross-origin frame. Nudging the player once it has booted recovers
  // those cases, and is a no-op where autoplay already worked.
  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => {
      const win = embed.current?.contentWindow;
      if (!win) return;
      for (const func of ["playVideo", "unMute"]) {
        win.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
      }
    }, 900);
    return () => clearTimeout(t);
  }, [on, channel]);

  // Paint the static while it is on screen. Drawn at a low resolution and
  // scaled up by the canvas itself, which is both cheaper and coarser — closer
  // to real analogue snow than per-pixel noise would be.
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
  // `enablejsapi` exists only so the nudge above can be received.
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
        {/* === ABSOLUTE VIDEO INSIDE THE FRAME === */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            zIndex: 20,
          }}
        >
          {/* Remounting on `channel` is what actually swaps the video: the
              embed ignores a changed `src` once it has booted. Nothing is
              mounted at all until the set is on, so no cold iframe can steal
              the first press. */}
          {on && (
            <iframe
              ref={embed}
              key={current.id}
              src={`https://www.youtube.com/embed/${current.id}?${params}`}
              title={current.label}
              allow="autoplay; encrypted-media; picture-in-picture"
              style={{ ...SCREEN, border: "none" }}
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* === THE DEAD SCREEN === */}
        {/* Black glass while the set is off. Not itself pressable: the play
            ball painted into the frame is the way in. */}
        {!on && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <div style={{ ...SCREEN, background: "#000" }} />
          </div>
        )}

        {/* === STATIC, over the picture and under the frame === */}
        {tuning && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              zIndex: 100,
              pointerEvents: "none",
            }}
          >
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
