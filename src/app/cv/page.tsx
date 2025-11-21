"use client";
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
      {/* Simple navigation buttons */}
      <button onClick={() => (window.location.href = "/")}>Home</button>
      <button onClick={() => (window.location.href = "/player")}>Player</button>

      <div
        style={{
          position: "relative",
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",
          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* Background Image */}
        <Image
          src="/next/image/cars.png"
          alt="CV Page"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />

        {/* --- Home Button (external link, no fade) --- */}
        <a
          href="https://igordubreucq.com"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            top: "1%",
            width: "28%",
            aspectRatio: "1 / 1",
            zIndex: 40,
            cursor: "pointer",
          }}
        >
          <Image
            src="/next/image/home2.png"
            alt="Home"
            fill
            style={{
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        </a>
      </div>
    </main>
  );
}
