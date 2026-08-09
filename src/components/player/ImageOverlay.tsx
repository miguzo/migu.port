"use client";
import { memo } from "react";
import Image from "next/image";
import { FRAME_SIZES } from "@/lib/player-config";

/**
 * The project page, the intro page and the about page were three near-identical
 * blocks. All of them are: a full-frame PNG, a click-anywhere-to-dismiss layer,
 * and optional invisible hotspot links on top.
 *
 * The dismiss layer is a <button> so it is announced properly, but it is kept
 * out of the tab order: the player is mouse and touch driven.
 */
export const ImageOverlay = memo(function ImageOverlay({
  src, alt, zIndex, onClose, closeLabel, children,
}: {
  src: string;
  alt: string;
  zIndex: number;
  onClose?: () => void;
  closeLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      style={{ position: "absolute", inset: 0, zIndex, background: "transparent" }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          tabIndex={-1}
          aria-label={closeLabel ?? `Close ${alt}`}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            background: "transparent", border: "none", cursor: "pointer", zIndex,
          }}
        />
      )}
      <Image
        src={src}
        alt=""
        fill
        sizes={FRAME_SIZES}
        style={{
          objectFit: "contain", objectPosition: "center",
          zIndex: zIndex + 1, pointerEvents: "none", userSelect: "none",
        }}
        priority
      />
      {children}
    </div>
  );
});
