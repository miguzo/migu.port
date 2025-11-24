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

      {/* --- HOME ICON (smaller version) --- */}
      <a
        href="https://igordubreucq.com"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: "1%",
          width: "14%",       // <-- fixed size
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

      {/* === MAIN CONTAINER MATCHING OTHER PAGES === */}
      <div
        style={{
          position: "relative",
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",
          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* === CENTER VIDEO === */}
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
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              width: "80%",
              height: "45%",
              border: "none",
              
              // ⭐ slight tilt to the right
              transform: "rotateZ(2deg)",
              transformOrigin: "center",
              borderRadius: "12px",
            }}
          />
        </div>

        {/* === TV FRAME OVERLAY === */}
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
