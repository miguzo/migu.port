"use client";
import { useEffect } from "react";

/**
 * Keyboard equivalents for the painted buttons. Everything here mirrors a
 * control that already exists on screen — no hidden features.
 *
 *   Space / K   play or pause
 *   ArrowRight  next track
 *   ArrowDown   next project
 *   Escape      close the open overlay
 */
export function useKeyboardControls({
  enabled, overlayOpen, onToggle, onNextTrack, onNextProject, onEscape,
}: {
  /** False while the splash is up or a fade is running. */
  enabled: boolean;
  /** While an overlay is open only Escape is accepted, matching the mouse behaviour. */
  overlayOpen: boolean;
  onToggle: () => void;
  onNextTrack: () => void;
  onNextProject: () => void;
  onEscape: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (overlayOpen) { e.preventDefault(); onEscape(); }
        return;
      }
      if (!enabled || overlayOpen) return;

      // Let Enter/Space activate a focused hotzone normally.
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.code === "Space" && (tag === "BUTTON" || tag === "A")) return;

      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          onToggle();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNextTrack();
          break;
        case "ArrowDown":
          e.preventDefault();
          onNextProject();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, overlayOpen, onToggle, onNextTrack, onNextProject, onEscape]);
}
