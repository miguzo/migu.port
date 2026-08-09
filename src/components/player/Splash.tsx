"use client";
import Image from "next/image";
import { Z } from "@/lib/player-config";

/**
 * Hand-drawn loading cover. Stays up until every critical image has settled,
 * then waits for a tap, click, Enter or Space to enter the site.
 */
export function Splash({
  ready, fading, progress, onEnter,
}: {
  ready: boolean;
  fading: boolean;
  progress: number;
  onEnter: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#111", zIndex: Z.splash,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "opacity 0.5s", opacity: fading ? 0 : 1,
      }}
    >
      {/* A button rather than a click-only div, so Enter/Space work too. */}
      <button
        type="button"
        onClick={onEnter}
        disabled={!ready}
        aria-label="Enter the player"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          background: "transparent", border: "none",
          cursor: ready ? "pointer" : "default",
        }}
      />
      <Image
        src="/next/image/Loading.png"
        alt="splash"
        width={430}
        height={620}
        priority
        style={{
          width: "min(98vw, 430px)", height: "auto", objectFit: "contain",
          maxHeight: "620px", maxWidth: "430px",
          userSelect: "none", pointerEvents: "none",
        }}
      />
      {/* Minimal loading bar */}
      <div
        role="progressbar"
        aria-label="Loading assets"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        style={{
          position: "absolute", left: 0, bottom: 0, height: 4, width: "100%",
          background: "rgba(255,255,255,0.06)", zIndex: Z.splash + 1,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: "100%", width: `${Math.round(progress * 100)}%`,
            background: "#867d50a8",
            transition: "width 0.3s cubic-bezier(.7,0,.3,1)", borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}
