"use client";
import { memo, useEffect, useRef } from "react";
import Image from "next/image";
import { FRAME_SIZES } from "@/lib/player-config";

/**
 * The project page, the intro page and the about page were three near-identical
 * blocks. All of them are: a full-frame PNG, a click-anywhere-to-dismiss layer,
 * and optional invisible hotspot links on top.
 *
 * The dismiss layer is a real <button>, so it is reachable by keyboard and
 * announced by screen readers instead of being a click-only <div>.
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
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus in on open and hand it back on close, so keyboard users are not
  // stranded behind the overlay.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (previous && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      style={{ position: "absolute", inset: 0, zIndex, background: "transparent" }}
    >
      {onClose && (
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
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
