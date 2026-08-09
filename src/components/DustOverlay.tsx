"use client";
import { useEffect, useRef } from "react";

/**
 * Floating dust motes drifting in front of the scene.
 *
 * Done in a canvas rather than baked into the artwork: motion is what makes
 * dust read as dust, and static specks painted into the PNG just look like
 * snow or a dirty lens. It also costs no image weight and stays tunable.
 *
 * The motes are drawn additively, so they glow faintly over the dark parts of
 * the room and stay almost invisible over the lit plinth — which is how real
 * dust behaves.
 */
export function DustOverlay({
  count = 150,
  /** Aspect ratio of the artwork, so motes stay inside the letterboxed picture. */
  aspect = 2127 / 1619,
  zIndex = 15,
}: {
  count?: number;
  aspect?: number;
  zIndex?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect the OS setting: no drifting particles for people who ask for
    // reduced motion.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const art = { x: 0, y: 0, w: 0, h: 0 };

    type Mote = {
      x: number; y: number;
      r: number;      // radius
      a: number;      // alpha
      vx: number; vy: number;
      phase: number;  // sway offset
      sway: number;
    };
    let motes: Mote[] = [];

    const layout = () => {
      const b = canvas.getBoundingClientRect();
      w = b.width;
      h = b.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The background uses object-fit: contain, so work out where the picture
      // actually sits and keep the dust inside it rather than over the bars.
      if (w / h > aspect) {
        art.h = h;
        art.w = h * aspect;
      } else {
        art.w = w;
        art.h = w / aspect;
      }
      art.x = (w - art.w) / 2;
      art.y = (h - art.h) / 2;
    };

    const spawn = (seedY?: number): Mote => ({
      x: art.x + Math.random() * art.w,
      y: seedY ?? art.y + Math.random() * art.h,
      // A spread of sizes: mostly tiny, a few nearer/larger ones.
      r: 0.45 + Math.random() * Math.random() * 1.7,
      a: 0.20 + Math.random() * 0.42,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.05 - Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
      sway: 0.1 + Math.random() * 0.4,
    });

    layout();
    motes = Array.from({ length: count }, () => spawn());

    let raf = 0;
    let last = performance.now();

    const frame = (t: number) => {
      const dt = Math.min(t - last, 50);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      // Hard-clip to the picture: the container is taller than carsnew.png, and
      // motes (or their glows) drifting over the letterbox bars break the
      // illusion that the dust is inside the room.
      ctx.beginPath();
      ctx.rect(art.x, art.y, art.w, art.h);
      ctx.clip();
      ctx.globalCompositeOperation = "lighter";

      for (const m of motes) {
        m.phase += dt * 0.0012;
        m.x += (m.vx + Math.sin(m.phase) * m.sway * 0.2) * dt * 0.06;
        m.y += m.vy * dt * 0.06;

        // Drift upward and wrap around.
        if (m.y < art.y - 6) {
          m.y = art.y + art.h + 6;
          m.x = art.x + Math.random() * art.w;
        }
        if (m.x < art.x - 6) m.x = art.x + art.w + 6;
        if (m.x > art.x + art.w + 6) m.x = art.x - 6;

        // A soft halo rather than a hard dot: a 1px circle is invisible at
        // these alphas, and the glow is what makes a mote read as catching
        // the light instead of looking like a dead pixel.
        const glow = m.r * 3;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, glow);
        g.addColorStop(0, `rgba(240, 233, 214, ${m.a})`);
        g.addColorStop(0.35, `rgba(238, 230, 210, ${m.a * 0.45})`);
        g.addColorStop(1, "rgba(238, 230, 210, 0)");
        ctx.beginPath();
        ctx.arc(m.x, m.y, glow, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => {
      layout();
      motes = Array.from({ length: count }, () => spawn());
    };
    window.addEventListener("resize", onResize);

    // Don't burn cycles in a background tab.
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, aspect, zIndex]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      data-dust
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
}
