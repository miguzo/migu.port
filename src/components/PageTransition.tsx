"use client";
import { useEffect } from "react";

export default function PageTransition() {
  useEffect(() => {
    const overlay = document.getElementById("transition-overlay");
    if (overlay) {
      overlay.style.opacity = "0";   // fade in on load
    }
  }, []);

  return (
    <div
      id="transition-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 1,
        transition: "opacity 0.6s ease",
      }}
    />
  );
}
