"use client";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(255,255,255,0.15)",
        padding: "10px 16px",
        borderRadius: "10px",
        border: "none",
        color: "white",
        cursor: "pointer",
        fontSize: "16px",
      }}
    >
      ⬅ Return
    </button>
  );
}
