"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeMenu() {
  const router = useRouter();
const [hovered, setHovered] = useState<null | "player" | "cv">(null);

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        background: "#19191b",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",
          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* === BACKGROUND IMAGE (blur applies here) === */}
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            inset: 0,
            filter: hovered ? "blur(6px)" : "none",
            transition: "filter 0.3s ease",
          }}
        >
          <Image
            src="/next/image/cars2.png"
            alt="Menu principal"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "contain",
              objectPosition: "center",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </div>

        {/* === OVERLAY PNGS (appear only on hover) === */}
        {hovered === "player" && (
          <Image
            src="/next/image/player_selected.png"
            alt="Player highlight"
            fill
            style={{
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
              position: "absolute",
              inset: 0,
              zIndex: 10,
            }}
          />
        )}

        {hovered === "cv" && (
          <Image
            src="/next/image/cv_selected.png"
            alt="CV highlight"
            fill
            style={{
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
              position: "absolute",
              inset: 0,
              zIndex: 10,
            }}
          />
        )}

        {/* === BUTTONS === */}
        <button
          onMouseEnter={() => setHovered("player")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => router.push("/player")}
          style={{
            position: "absolute",
            left: "19%",
            top: "40%",
            width: "15%",
            height: "12%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            zIndex: 20,
          }}
        />

        <button
          onMouseEnter={() => setHovered("cv")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => router.push("/cv")}
          style={{
            position: "absolute",
            left: "65%",
            top: "40%",
            width: "20%",
            height: "20%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            zIndex: 20,
          }}
        />
      </div>
    </main>
  );
}
