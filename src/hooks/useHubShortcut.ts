"use client";
import { useEffect } from "react";

/**
 * The only keyboard binding on the player: "i" leaves for the hub menu.
 *
 * The play/pause and next-track shortcuts, and Escape-to-close, were removed
 * deliberately — the player is mouse and touch driven.
 */
export function useHubShortcut({
  enabled,
  onOpenHub,
}: {
  /** False while the splash is up or a fade is running. */
  enabled: boolean;
  onOpenHub: () => void;
}) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "KeyI" || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      onOpenHub();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onOpenHub]);
}
