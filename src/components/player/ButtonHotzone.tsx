"use client";
import { memo } from "react";
import { BUTTON_LABELS, type TopButtonPos } from "@/data/projects";
import { Z } from "@/lib/player-config";

/**
 * An invisible hit area over the painted button in the artwork.
 *
 * These used to carry tabIndex={-1}, which made the entire player unreachable
 * by keyboard. They are now in the natural tab order; globals.css draws a
 * focus ring on :focus-visible so the focused zone is actually findable.
 */
export const ButtonHotzone = memo(function ButtonHotzone({
  idx, pos, onClick, disabled,
}: {
  idx: number;
  pos: TopButtonPos;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={BUTTON_LABELS[idx]}
      onClick={e => {
        // A mouse or touch press must not leave focus parked on the hotzone,
        // or the global Space shortcut would re-fire this button instead of
        // toggling playback. Keyboard activation reports detail === 0, and
        // keeps focus so tabbing through the controls still works.
        if (e.detail > 0) e.currentTarget.blur();
        onClick();
      }}
      disabled={disabled}
      style={{
        ...pos,
        position: "absolute",
        background: "transparent",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        zIndex: Z.hotzone,
      }}
    />
  );
});
