"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function VideoPage() {
  const router = useRouter();

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
      {/* --- INVISIBLE NAV BUTTONS --- */}
      <button
        onClick={() => router.push("/")}
        aria-label="Home"
        style={{
          position: "absolute",
          left: "5%",
          top: "5%",
          width: "10%",
          height: "10%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 50,
        }}
      />

      {/* --- HOME ICON --- */}
      <a
        href="https://igordubreucq.com"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: "1%",
          width: "12%",
          aspectRatio: "1 / 1",
          zIndex: 60,
          cursor: "pointer",
        }}
      >
        <Image
          src="/next/image/home2.png"
          alt="Home"
          fill
          style={{ objectFit: "contain", pointerEvents: "none" }}
        />
      </a>

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
              width: "65%",
              height: "55%",
              border: "none",

              // ⭐ Reverse tilt + shift right by 5%
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
