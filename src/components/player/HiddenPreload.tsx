"use client";
import { memo } from "react";
import Image from "next/image";
import { FRAME_SIZES } from "@/lib/player-config";

/**
 * Renders images off-screen through next/image so the browser fetches exactly
 * the URLs the real render will ask for. Duplicate renders of the same src
 * share one entry in the browser's image cache, so nothing downloads twice.
 *
 * `sizes` must match the real render — see FRAME_SIZES.
 */
export const HiddenPreload = memo(function HiddenPreload({
  sources,
  onSettled,
}: {
  sources: string[];
  /** Fires once per source on either load or error, so a 404 cannot stall the splash. */
  onSettled?: (src: string) => void;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed", left: 0, top: 0, width: 1, height: 1,
        overflow: "hidden", opacity: 0, pointerEvents: "none", zIndex: -1,
      }}
    >
      {sources.map(src => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes={FRAME_SIZES}
          loading="eager"
          onLoad={() => onSettled?.(src)}
          onError={() => onSettled?.(src)}
        />
      ))}
    </div>
  );
});
