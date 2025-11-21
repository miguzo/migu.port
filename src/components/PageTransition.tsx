"use client";
import { useEffect, useState } from "react";

export default function PageTransition() {
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    setTimeout(() => setFadeIn(false), 20);
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
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    />
  );
}
