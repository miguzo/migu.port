"use client";
import { useRouter } from "next/navigation";

/**
 * A way back to the hub for pages that would otherwise be dead ends.
 *
 * Deliberately visible rather than an invisible hotspot: unlike the player and
 * the hub, these pages have no painted button in the artwork for it to sit on,
 * so an invisible zone would be undiscoverable.
 */
export function BackToMenu({ href = "/hub" }: { href?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="back-to-menu"
      onClick={() => router.push(href)}
      aria-label="Back to menu"
    >
      ← Menu
    </button>
  );
}
