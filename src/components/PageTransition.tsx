"use client";
import { useEffect } from "react";

export default function PageTransition() {
  useEffect(() => {
    const overlay = document.getElementById("transition-overlay");

    // Wait for the ENTER click on first visit
    const alreadyEntered = localStorage.getItem("entered") === "true";

    if (alreadyEntered) {
      // User already clicked ENTER before → fade in immediately
      setTimeout(() => {
        if (overlay) overlay.style.opacity = "0";
      }, 20);
    }
    // Else → DO NOTHING
    // The overlay stays BLACK until the user clicks ENTER
  }, []);

  return (
    <div
      id="transition-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        pointerEvents: "none",
        zIndex: 9998,
        opacity: 1,
        transition: "opacity 0.6s ease",
      }}
    />
  );
}
