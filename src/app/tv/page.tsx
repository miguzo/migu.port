"use client";
import Image from "next/image";
import { BackToMenu } from "@/components/BackToMenu";

export default function VideoPage() {
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
        position: "relative",
      }}
    >
      <BackToMenu />

      {/* === SIZE LIKE THE MENU BACKGROUND (same logic) === */}
      <div
        style={{
          position: "relative",
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",
          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* === ABSOLUTE VIDEO INSIDE THE FRAME === */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            zIndex: 20,
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/rTYdjkZaPh0?controls=0&modestbranding=1&rel=0&showinfo=0"
            style={{
              width: "80%",
              height: "54%",
              border: "none",
              transform: "translateX(3%) rotateY(20deg)",
            }}
            allowFullScreen
          ></iframe>
        </div>

        {/* === PNG FRAME OVERLAY === */}
        <Image
          src="/next/image/tv_frame.png"
          alt="TV Frame"
          fill
          style={{
            objectFit: "contain",
            objectPosition: "center",
            pointerEvents: "none",
            zIndex: 200,
          }}
        />
      </div>
    </main>
  );
}
