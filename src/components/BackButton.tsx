"use client";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      style={{
        position: "absolute",
        top: "20px",       // ← change this for perfect positioning
        left: "20px",
        width: "60px",     // ← change to match your PNG size
        height: "60px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        zIndex: 9999
      }}
      aria-label="Return to Main Menu"
    />
  );
}
