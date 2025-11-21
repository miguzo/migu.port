"use client";
import { useEffect } from "react";

export default function PageTransition() {
  useEffect(() => {
    const overlay = document.getElementById("transition-overlay");
    if (!overlay) return;

    const alreadyEntered = localStorage.getItem("entered") === "true";

    if (alreadyEntered) {
      // Fade in the page immediately on returning visits
      setTimeout(() => {
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
      }, 30);
    } else {
      // First visit:
      // ENTER overlay will control fade-out manually
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto"; // Block page until ENTER click
    }
  }, []);

  return (
    <div
      id="transition-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        pointerEvents: "auto",
        zIndex: 9998,
        opacity: 1,
        transition: "opacity 0.6s ease",
      }}
    />
  );
}
