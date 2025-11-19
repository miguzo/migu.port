"use client";
import { useRouter } from "next/navigation";

export default function HomeButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      style={{
        position: "absolute",
        left: "4%",     // move left-right
        top: "4%",      // move up-down
        width: "12%",   // size
        height: "7%",   // size
        background: "transparent",
        border: "none",
        cursor: "pointer",
        zIndex: 9999,
      }}
      aria-label="Home"
    />
  );
}
