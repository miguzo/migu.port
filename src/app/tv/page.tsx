"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BackToMenu } from "@/components/BackToMenu";
import { HUB_SIZES } from "@/lib/player-config";

/** Never hold the page black longer than this, even if YouTube never loads. */
const REVEAL_TIMEOUT_MS = 3000;

export default function VideoPage() {
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Continues the hub's fade-to-black: arrive black, then reveal once the TV
  // frame and the embed are actually up, instead of showing a half-built page.
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), REVEAL_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const ready = (frameLoaded && videoLoaded) || timedOut;

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
          <iframe
            src="https://www.youtube.com/embed/rTYdjkZaPh0?controls=0&modestbranding=1&rel=0&showinfo=0"
            title="Video"
            onLoad={() => setVideoLoaded(true)}
            style={{
              width: "80%",
              height: "54%",
              border: "none",
              transform: "translateX(3%) rotateY(20deg)",
            }}
            allowFullScreen
          ></iframe>
        </div>

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
      </div>
    </main>
  );
}
