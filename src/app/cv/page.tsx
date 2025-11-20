"use client"
import Image from "next/image";

export default function CVPage() {
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

          // ALLOWS BIGGER SIZE ON DESKTOP
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",

          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* === BACKGROUND IMAGE (cars.png) === */}
        <Image
          src="/next/image/cars.png"
          alt="CV Page"
          fill
          priority
          /* ALLOWS UPSCALING */
          sizes="100vw"
          style={{
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
{/* --- SIMPLE HOME BUTTON --- */}
  <a
    href="https://igordubreucq.com"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      position: "absolute",
      left: "5%",
      top: "5%",
      width: "15%",
      aspectRatio: "1 / 1",   // <-- THIS FIXES THE HEIGHT
      zIndex: 40,
      cursor: "pointer",
    }}
  >
    <Image
      src="/next/image/home.png"
      alt="Home Button"
      fill
      style={{
        objectFit: "contain",
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  </a>

      </div>
    </main>
  );
}
