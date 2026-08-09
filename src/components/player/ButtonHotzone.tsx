"use client";
import { memo } from "react";
import { BUTTON_LABELS, type TopButtonPos } from "@/data/projects";
import { Z } from "@/lib/player-config";

/**
 * An invisible hit area over the painted button in the artwork.
 *
 * tabIndex={-1} keeps these out of the tab order: the player is mouse and
 * touch driven, and a focused hotzone would have no visible indicator anyway
 * now that focus rings are off.
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
      onClick={onClick}
      disabled={disabled}
      tabIndex={-1}
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
