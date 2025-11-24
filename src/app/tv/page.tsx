"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// --- YOUTUBE IFRAME API TYPES ---
declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLIFrameElement | string,
        config: Record<string, unknown>
      ) => YTPlayer;
      PlayerState: Record<string, number>;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
}

export default function VideoPage() {
  const router = useRouter();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const [overlayVisible, setOverlayVisible] = useState(true);
  const [locked, setLocked] = useState(false);

  // === LOAD YOUTUBE API ===
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };
  }, []);

  // === CREATE PLAYER ===
  const createPlayer = () => {
    if (!iframeRef.current || !window.YT || !window.YT.Player) return;

    playerRef.current = new window.YT.Player(iframeRef.current, {
      events: {},
    });
  };

  // === PLAY BUTTON ===
  const handlePlay = () => {
    if (!playerRef.current) return;

    playerRef.current.playVideo(); // play WITH sound

    setOverlayVisible(false);

    setTimeout(() => setLocked(true), 600); // lock UI
  };

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

      {/* === MAIN FRAME CONTAINER === */}
      <div
        style={{
          position: "relative",
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",
          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* === INVISIBLE CUSTOM PLAY BUTTON (YOU POSITION THIS) === */}
        <button
          onClick={handlePlay}
          style={{
            position: "absolute",
            left: "20%",  // CHANGE THIS where you want
            top: "70%",   // CHANGE THIS where you want
            width: "20%",
            height: "10%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            zIndex: 300,
          }}
        />

        {/* === BLACK OVERLAY (FADES OUT) === */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "black",
            opacity: overlayVisible ? 1 : 0,
            transition: "opacity 0.8s ease",
            zIndex: 150,
            pointerEvents: "none",
          }}
        />

        {/* === VIDEO === */}
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
            ref={iframeRef}
            id="ytplayer"
            src="https://www.youtube.com/embed/rTYdjkZaPh0?enablejsapi=1&controls=0&modestbranding=1&rel=0&showinfo=0"
            style={{
              width: "65%",
              height: "62%",
              border: "none",
              transform: "translateX(3%) rotateY(20deg)",
              pointerEvents: locked ? "none" : "auto",
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>

        {/* === TV FRAME === */}
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
