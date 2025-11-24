"use client";
import { useRouter } from "next/navigation";

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

      <button
        onClick={() => router.push("/player")}
        aria-label="Player"
        style={{
          position: "absolute",
          right: "5%",
          top: "5%",
          width: "10%",
          height: "10%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 50,
        }}
      />

      {/* --- VIDEO CONTAINER --- */}
      <div
        style={{
          position: "relative",
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 0.56), 504px)", // 16:9 ratio
          maxWidth: "900px",
          maxHeight: "504px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 25px rgba(0,0,0,0.4)",
        }}
      >
        <iframe
          src="https://www.youtube.com/embed/rTYdjkZaPh0?controls=0&modestbranding=1&rel=0&showinfo=0"
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    </main>
  );
}
