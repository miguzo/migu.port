"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * A way back to the hub for pages that would otherwise be dead ends.
 *
 * Deliberately visible rather than an invisible hotspot: unlike the player and
 * the hub, these pages have no painted button in the artwork for it to sit on,
 * so an invisible zone would be undiscoverable. Escape works too.
 */
export function BackToMenu({ href = "/hub" }: { href?: string }) {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        router.push(href);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, href]);

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
